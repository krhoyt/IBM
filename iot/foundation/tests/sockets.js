// Packages
var express = require( 'express' );
var http = require( 'http' );
var socketio = require( 'socket.io' );
var path = require( 'path' );
var cfenv = require( 'cfenv' );

// Environment
var environment = cfenv.getAppEnv();

// Web
var app = express();

// Static content
app.use( '/', express.static( 'public' ) );

// Socket.IO
var server = http.Server( app );
var io = socketio( server );

io.on( 'connection', function( socket ) {
  socket.emit( 'news', { 
      hello: 'world' 
  } );
  socket.on( 'test', function( data ) {
    console.log( data );
  } );
} );

server.listen( environment.port, function() {
    console.log( environment.url );
} );
