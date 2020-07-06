var cfenv = require( 'cfenv' );
var cors = require( 'cors' );
var express = require( 'express' );
var jsonfile = require( 'jsonfile' );
var mqtt = require( 'mqtt' );
var parser = require( 'body-parser' );

// Constants
var IOT_CLIENT = 'a:ts200f:node';
var IOT_SERVER = 'mqtt://ts200f.messaging.internetofthings.ibmcloud.com';

// Read individual settings
var config = jsonfile.readFileSync( __dirname + '/config.json' );

var client = null;

if( config.iot.enabled ) {
    // Connect to Watson IoT
    var client = mqtt.connect( IOT_SERVER, {
        clientId: IOT_CLIENT,
        username: config.iot.key,
        password: config.iot.token
    } );

    // Connected to Watson IoT
    client.on( 'connect', function() {
        // Debug
        console.log( 'Connected to Watson.' );
    } );    
}

// Application
var app = express();

// Middleware
app.use( parser.json() );
app.use( parser.urlencoded( { 
	extended: false 
} ) );

// Cross domain access
app.use( cors() );

// Per-request actions
app.use( function( req, res, next ) {
	// Cross domain support
	// res.header( 'Access-Control-Allow-Origin', '*' );
	// res.header( 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept' );	
	
	// Configuration
	req.config = config;
  req.iot = client;
	
	// Just keep swimming
	next();
} );

// Static for main files
app.use( '/', express.static( 'public' ) );

// Routes
app.use( '/stt', require( './routes/stt' ) );
app.use( '/conversation', require( './routes/conversation' ) );
app.use( '/tts', require( './routes/tts' ) );
app.use( '/visual', require( './routes/visual' ) );
app.use( '/translate', require( './routes/translate' ) );
app.use( '/alchemy', require( './routes/alchemy' ) );
app.use( '/tone', require( './routes/tone' ) );
app.use( '/personality', require( './routes/personality' ) );

// Cloud Foundry support
// Bluemix
var env = cfenv.getAppEnv();

// Start server
app.listen( env.port, '0.0.0.0', function() {
	// Debug
	console.log( 'Started on: ' + env.port );
} );
