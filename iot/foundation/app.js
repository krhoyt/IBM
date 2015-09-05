var parser = require( 'body-parser' );
var cfenv = require( 'cfenv' );
var express = require( 'express' );
var http = require( 'http' );
var jsonfile = require( 'jsonfile' );
var mongoose = require( 'mongoose' );
var mqtt = require( 'mqtt' );
var path = require( 'path' );
var ws = require( 'ws' );

// Configuration
var configuration = jsonfile.readFileSync( path.join( __dirname, 'configuration.json' ) );

// Environment
var environment = cfenv.getAppEnv();

/*
// Database
mongoose.connect( 'mongodb://bluemix:jaiN8foi@dogen.mongohq.com:10005/humidorio' );

mongoose.connection.on( 'connected', function() {
    console.log( 'Connected to Compose.' );
} );
*/

// MQTT
var id = 
	'a:' + 
	configuration.organizationId + ':' + 
	'Bluemix';
var topic = 
    'iot-2/type/' +
    configuration.devices[0].deviceType + '/' +
    'id/' +
    configuration.devices[0].deviceId + '/' +
    'cmd/tictactoe/fmt/json';           
var uri = 
	'tcp://' + 
	configuration.uri + ':' + 
	'1883';

// Debug
console.log( 'MQTT client: ' + id );
console.log( 'MQTT URI: ' + uri );

// Connect
var iot = mqtt.connect( uri, {
	clientId: id,
	clean: true,
	username: configuration.keys[2].apiKey,
	password: configuration.keys[2].authenticationToken
} ); 

iot.on( 'connect', function() {
	// Debug
	console.log( 'NQTT connected.' );
} );

// Sockets
var server = http.createServer();
var socket = new ws.Server( {
    server: server
} );

socket.on( 'connection', function( client ) {
    // Debug
    console.log( 'WebSocket connection.' );
    
    // Message
    client.on( 'message', function( message ) {
        var data = null;
        var device = null;
        
        // Debug
        console.log( message );
                
        // Send to all but originating client
        for( var c = 0; c < socket.clients.length; c++ ) {
            if( socket.clients[c] != this ) {
                socket.clients[c].send( message );    
            }
        }
        
        data = JSON.parse( message );
        
        // Send to device
        device = {
            d: {
                change: data.led + ',' + data.red + ',' + data.green + ',' + data.blue   
            }
        };        
        
        iot.publish( topic, JSON.stringify( device ), function() {
            console.log( device );
        } );        
    } );
} );

// Web
var app = express();

// Middleware
app.use( parser.json() );
app.use( parser.urlencoded( { 
	extended: false 
} ) );

// Add functionality if needed
app.use( function( req, res, next ) {
    req.config = configuration;
    req.iot = iot;
    req.socket = socket;
    req.topic = topic;
    next();
} );

// Static
app.use( '/', express.static( 'public' ) );

// Routing
app.use( '/api', require( './routes/tictactoe.js' ) );

// Listen
server.on( 'request', app );
server.listen( environment.port, function() {
    console.log( environment.url );
} );
