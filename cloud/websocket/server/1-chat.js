// Packages
var parser = require( 'body-parser' );
var cfenv = require( 'cfenv' );
var express = require( 'express' );
var http = require( 'http' );
var ws = require( 'ws' );

// Environment
var environment = cfenv.getAppEnv();

// Web
var app = express();

// Middleware
app.use( parser.json() );
app.use( parser.urlencoded( { 
	extended: false 
} ) );

// Static
app.use( '/', express.static( 'public' ) );

// Sockets
var server = http.createServer();
var socket = new ws.Server( {
    server: server
} );

// Connection
socket.on( 'connection', function connection( connection ) {
    
    // Message
    connection.on( 'message', function( message ) {
        
        // Echo
        for( var c = 0; c < socket.clients.length; c++ ) {
            socket.clients[c].send( message );
        }
        
    } );
    
} );

// Listen
server.on( 'request', app );
server.listen( environment.port, function() {
    console.log( environment.url );
} );
