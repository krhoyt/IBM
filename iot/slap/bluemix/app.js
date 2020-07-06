var cfenv = require( 'cfenv' );
var express = require( 'express' );
var jsonfile = require( 'jsonfile' );
var mqtt = require( 'mqtt' );

// Configuration
var config = jsonfile.readFileSync( 'config.json' );

// Application
var app = express();

// Static for main files
app.use( '/', express.static( 'public' ) );

// Bluemix
var env = cfenv.getAppEnv();

// Listen
var server = app.listen( env.port, env.bind, function() {
	// Debug
	console.log( 'Started on: ' + env.port );
} );

// Connect to Watson IoT
var client  = mqtt.connect( 
  config.iot_host, 
  {
    clientId: config.iot_client + '_' + Math.round( ( Math.random() * 10000 ) ),
    username: config.iot_username,
    password: config.iot_password,
    port: 1883
  }
);

// Socket
var io = require( 'socket.io' )( server );

// New socket connection
io.on( 'connection', function( socket ) {
  console.log( 'Client connected.' );
} );

// Connected to Watson
// Subscribe for sensor data
client.on( 'connect', function() {
  console.log( 'Broker connected.' );

  client.subscribe( config.iot_topic, function( error, granted ) {
    console.log( 'Subscribed.' );
  } );
} );

// New message arrived
client.on( 'message', function( topic, message ) {
  console.log( message.toString() );

  // Send to client screen
  io.emit( 'slap', message.toString() );
} );
