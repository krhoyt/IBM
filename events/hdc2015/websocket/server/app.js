var parser = require( 'body-parser' );
var cfenv = require( 'cfenv' );
var express = require( 'express' );
var http = require( 'http' );
var ws = require( 'ws' );

// Environment
var environment = cfenv.getAppEnv();
var echo = false;

// Web
var app = express();

// Middleware
app.use( parser.json() );
app.use( parser.urlencoded( { 
	extended: false 
} ) );

// Static
app.use( '/', express.static( 'public' ) );

// Get echo mode
app.get( '/api/echo', function( request, response ) {
    response.send( echo );
} );

// Set echo mode
app.put( '/api/echo', function( request, response ) {
    echo = request.body.echo;
    response.send( echo );
} );

// Sockets
var server = http.createServer();
var sockets = new ws.Server( {
    server: server
} );

sockets.on( 'connection', function( client ) {
    // Debug
    console.log( 'Connection.' );

    // Echo messages to all clients
    client.on( 'message', function( message ) {
        var data = null;
        
        data = JSON.parse( message );
        
        for( var c = 0; c < sockets.clients.length; c++ )
        {
            // Optionally not back to self 
            // Check application level flag
            // Server setting wins
            if( echo )
            {
                sockets.clients[c].send( message );                                
            } else {
                // Message level flag
                if( data.echo )
                {
                    sockets.clients[c].send( message );                                    
                } else {
                    // Do not echo
                    if( sockets.clients[c] != this )
                    {
                        sockets.clients[c].send( message );                                    
                    }                                    
                }
            }
        }
    } );
} );

// Listen
server.on( 'request', app );
server.listen( environment.port, function() {
    console.log( environment.url );
} );
