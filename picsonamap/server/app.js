var express = require( 'express' );
var ibmbluemix = require( 'ibmbluemix');
var ibmdata = require( 'ibmdata' );

/*
 * Configuration
 */

ibmbluemix.initialize( {
	applicationId: '_YOUR_APPLICATION_ID_',
	applicationRoute: '_YOUR_APPLICATION_ROUTE_',
	applicationSecret: '_YOUR_APPLICATION_SECRET_'
} );

var ibmlogger = ibmbluemix.getLogger();
var ibmconfig = ibmbluemix.getConfig();

/*
 * Web server
 */

var app = express();

// Send URL root to context root
app.get( '/', function( req, res ) {
	res.sendFile( __dirname + '/public/index.html' );
} );

// Static content
app.use( ibmconfig.getContextRoot() + '/public', express.static( 'public' ) );

// Initialize services
app.use( function( req, res, next ) {
    req.data = ibmdata.initializeService( req );
    req.logger = ibmlogger;
    next();
} );

// init basics for an express app
app.use( require( './lib/setup' ) );

// Route endpoints
app.use( ibmconfig.getContextRoot(), require( './lib/reset' ) );
app.use( ibmconfig.getContextRoot(), require( './lib/image' ) );

// Start server
app.listen( ibmconfig.getPort() );
ibmlogger.info( 'Server started at port: ' + ibmconfig.getPort() );
