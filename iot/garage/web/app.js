var cfenv = require( 'cfenv' );
var cors = require( 'cors' );
var express = require( 'express' );
var jsonfile = require( 'jsonfile' );
var mqtt = require( 'mqtt' );
var parser = require( 'body-parser' );
var request = require( 'request' );

// External configuration
config = jsonfile.readFileSync( __dirname + '/config.json' );

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
	// Configuration
	req.config = config;
	
	// Just keep swimming
	next();
} );

// Static for main files
app.use( '/', express.static( 'public' ) );

// Routes
app.use( '/api', require( './routes/stt' ) );
app.use( '/api', require( './routes/tts' ) );

// Bluemix
var env = cfenv.getAppEnv();

// Listen
var server = app.listen( env.port, env.bind, function() {
	// Debug
	console.log( 'Started on: ' + env.port );
} );

// Connect to Watson IoT
var client  = mqtt.connect( 
  config.iot.host, 
  {
    clientId: config.iot.client + '_' + Math.round( ( Math.random() * 10000 ) ),
    username: config.iot.user,
    password: config.iot.password,
    port: config.iot.port
  }
);

// Socket
var io = require( 'socket.io' )( server );

// New socket connection
io.on( 'connection', function( socket ) {
  // Listen for camera command
  // From web client
  socket.on( 'monitor', function( data ) {
    // Debug
    console.log( data );
    
    client.publish( config.iot.command, JSON.stringify( data ) );
  } );
} );

// Connected to Watson
// Subscribe for monitoring result
client.on( 'connect', function() {
  console.log( 'Connected.' );

  client.subscribe( config.iot.event, function( error, granted ) {
    console.log( 'Garage.' );
  } );
} );

// New message arrived
client.on( 'message', function( topic, message ) {
  var data = null;
  var destination = null;

  // Parse JSON
  data = JSON.parse( message.toString() );

  if( topic == config.iot.event ) {
    // Debug
    console.log( data.images[0].classifiers[0].classes[0].class )
    
    // Send to web client
    io.emit( 'garage', data );    
  }
} );
