// Packages
var Cloudant = require( 'cloudant' );
var express = require( 'express' );
var ibmbluemix = require( 'ibmbluemix' );
var jsonfile = require( 'jsonfile' );
var parser = require( 'body-parser' );
var path = require( 'path' );

// Constants
var CLOUDANT_DATABASE = 'weather';
var CLOUDANT_PROPERTY = 'cloudantNoSQLDB';
var CONFIGURATION_FILE = 'configuration.json';
var CONFIGURATION_PATH = 'public';
var PUBNUB_CHANNEL = 'weather_channel';

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
						celcius: 0,
						fahrenheit: 32,					
						humidity: 68,
						sensor: 'abc-123',
						timestamp: 12345,											
						version: '0.0.1',
						voltage: 3.3	
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
		ibmlogger.info( 'Change: ' + change.doc.fahrenheit );
		
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
app.use( ibmconfig.getContextRoot(), require( './routes/reading' ) );

// Server
app.listen( ibmconfig.getPort() );
ibmlogger.info( 'Server started at port: ' + ibmconfig.getPort() );

// http://iot-weather.mybluemix.net/iot-weather/v1/apps/c02e7aae-bf7d-417f-85df-5a605de208d3
// http://localhost:3000/iot-weather/v1/apps/c02e7aae-bf7d-417f-85df-5a605de208d3
