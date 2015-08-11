// Packages
var Cloudant = require( 'cloudant' );
var express = require( 'express' );
var ibmbluemix = require( 'ibmbluemix' );
var jsonfile = require( 'jsonfile' );
var parser = require( 'body-parser' );
var path = require( 'path' );

// Constants
var CLOUDANT_DATABASE = 'picture';
var CLOUDANT_PROPERTY = 'cloudantNoSQLDB';
var CONFIGURATION_FILE = 'configuration.json';
var CONFIGURATION_PATH = 'public';
var PUBNUB_CHANNEL = 'picture_channel';

// Configuration
var configuration = jsonfile.readFileSync( path.join( __dirname, CONFIGURATION_PATH, CONFIGURATION_FILE ) );

// Bluemix
ibmbluemix.initialize( configuration.bluemix );

// Environment
var ibmconfig = ibmbluemix.getConfig();

// Logging
var ibmlogger = ibmbluemix.getLogger();

// Local or cloud
if( ibmconfig.getVcapServices().hasOwnProperty( CLOUDANT_PROPERTY ) )
{
	configuration.cloudant = ibmconfig.getVcapServices().cloudantNoSQLDB[0].credentials;
}

// Database
var ibmdb = null;

// Connect
Cloudant( {
	account: configuration.cloudant.username,
	password: configuration.cloudant.password
}, function( error, cloudant ) {
	if( error )
	{
		ibmlogger.info( 'Could not connect to Cloudant.' );
		ibmlogger.info( 'Message: ' + error.message );
	}	
	
	ibmlogger.info( 'Connected to Cloudant.' );
	
	// Check for database
	cloudant.db.list( function( error, all ) {
		var found = false;
		
		if( error ) 
		{
			ibmlogger.info( 'Problem connecting to database.' );
			ibmlogger.info( 'Message: ' + error.message );			
		}
		
		if( all.join( ',' ).indexOf( CLOUDANT_DATABASE ) >= 0 )
		{
			ibmlogger.info( 'Found database.' );
			found = true;
		} else {
			ibmlogger.info( 'Database not found.' );
		}
		
		if( found )
		{
			// Use database
			ibmlogger.info( 'Using database.' );
			ibmdb = cloudant.db.use( CLOUDANT_DATABASE );
						
			// Publish-subscribe
			createStream();						
						
			// Ready
			ibmlogger.info( 'Ready.' );			
		} else {
			ibmlogger.info( 'Creating database.' );
			
			// Create database
			cloudant.db.create( CLOUDANT_DATABASE, function( error ) {
				var index = null;
				
				if( error )
				{
					ibmlogger.info( 'Problem creating database.' );
					ibmlogger.info( 'Message: ' + error.message );								
				}	
				
				// Use database
				ibmlogger.info( 'Using database.' );
				ibmdb = cloudant.db.use( CLOUDANT_DATABASE );
				
				// Index
				index = {
					name: 'timestamp-index',
					type: 'json',
					index: {
						fields: ['timestamp']
					}	
				};
				
				ibmlogger.info( 'Creating index.' );
				ibmdb.index( index, function( error, body ) {
					if( error )
					{
						ibmlogger.info( 'Sort index failed.' );
						ibmlogger.info( 'Message: ' + error.message );														
					}
					
					ibmlogger.info( 'Index created.' );
					
					// Test insert
					ibmlogger.info( 'Testing database.' );
					ibmdb.insert( {
						src: 'image.jpg',
						timestamp: 12345,
						latitude: 12.34,
						longitude: -56.78
					}, function( error, body, header ) {
						if( error )
						{
							ibmlogger.info( 'Problem with test insert.' );
							ibmlogger.info( 'Message: ' + error.message );
						}
						
						ibmlogger.info( 'Test insert completed.' );
						ibmlogger.info( 'Cleaning up test insert.' );
						
						// Clean up test
						ibmdb.destroy( body.id, body.rev, function( error, body ) {
							if( error )
							{
								ibmlogger.info( 'Problem removing test record.' );
								ibmlogger.info( 'Message: ' + error.message );
							}	
											
							// Publish-subscribe
							createStream();											
														
							// Ready
							ibmlogger.info( 'Ready.' );
						} );
					} );						
				} );
			} );
		}
	} );
} );

// Publish-Subscribe
// PubNub
var pubnub = require( 'pubnub' )( configuration.pubnub );
var stream = null;

// Called to listen for changes
// Sends data across publish-subscribe
function createStream()
{
	// Setup push
	ibmlogger.info( 'Adding publish-subscribe.' );
	stream = ibmdb.follow( {
		include_docs: true, 
		since: 'now'
	} );

	// Database change (new reading)
	stream.on( 'change', function( change ) {
		ibmlogger.info( 'Change: ' + change.doc._id );
		
		pubnub.publish( { 
    		channel: PUBNUB_CHANNEL,
    		message: change.doc,
    		callback : function( results ) {
				ibmlogger.info( results[1] + ': ' + results[2] );  
			},
    		error: function( error ) {
				ibmlogger.info( 'Failed to publish message.' );
				ibmlogger.info( error );  
			}
		} );
	} );
	
	// Start listening
	ibmlogger.info( 'Listening for changes.' );
	stream.follow();	
}

// Web
var app = express();

// Middleware
app.use( parser.json() );
app.use( parser.urlencoded( { 
	extended: false 
} ) );

// Add functionality to request
app.use( function( req, res, next ) {
	req.data = ibmdb;
	req.logger = ibmlogger;
	next();
} );

// Static content
app.use( '/', express.static( 'public' ) );

// Routing
app.use( ibmconfig.getContextRoot(), require( './routes/picture' ) );
app.use( ibmconfig.getContextRoot(), require( './routes/attachment' ) );
app.use( ibmconfig.getContextRoot(), require( './routes/manage' ) );

// Server
app.listen( ibmconfig.getPort() );
ibmlogger.info( 'Server started at port: ' + ibmconfig.getPort() );

// http://pics-on-a-map.mybluemix.net/pics-on-a-map/v1/apps/6982d829-9411-4425-ae74-e6f89b717595
// http://localhost:3000/pics-on-a-map/v1/apps/6982d829-9411-4425-ae74-e6f89b717595
