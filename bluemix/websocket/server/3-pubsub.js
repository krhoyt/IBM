// Packages
var parser = require( 'body-parser' );
var cfenv = require( 'cfenv' );
var express = require( 'express' );
var http = require( 'http' );
var jsonfile = require( 'jsonfile' );
var mongoose = require( 'mongoose' );
var path = require( 'path' );
var ws = require( 'ws' );

// Environment
var environment = cfenv.getAppEnv();
var configuration = jsonfile.readFileSync( path.join( __dirname, 'configuration.json' ) );

// Database
mongoose.connect( configuration.compose );

mongoose.connection.on( 'connected', function() {
    console.log( 'Connected to Compose.' );
} );

// Model
var Chat = require( path.join( __dirname, 'models/chat' ) );

// Web
var app = express();

// Middleware
app.use( parser.json() );
app.use( parser.urlencoded( { 
	extended: false 
} ) );

// Static
app.use( '/', express.static( 'public' ) );

// Routes
app.use( '/api', require( './routes/chat.js' ) );

// Sockets
var server = http.createServer();
var socket = new ws.Server( {
    server: server
} );

// Connection
socket.on( 'connection', function connection( connection ) {
    
    // Message
    connection.on( 'message', function( message ) {
        var body = null;
        var chat = null;
        var client = null;
        
        // Parse
        body = JSON.parse( message );

        // Action
        switch( body.action ) {                
            // History
            case 'read_all':
                // Reference requesting client
                client = this;
                
                // Find and send back to requesting client
                Chat.find( {}, null, {sort: {createdAt: 1}}, function( error, data ) {                    
                    client.send( JSON.stringify( {
                        action: body.action,
                        data: data
                    } ) );    
                } );                
                
                break;
                
            // Create
            case 'create':
                chat = new Chat();

                chat.blue = body.blue;
                chat.client = body.client;
                chat.createdAt = Date.now();
                chat.css = 'rgb( ' + body.red + ', ' + body.green + ', ' + body.blue + ' )';
                chat.green = body.green;
                chat.message = body.message;
                chat.red = body.red;

                // Save the entry
                chat.save( function( error, result ) {
                    if( error ) {
                        console.log( error );    
                    }

                    // Debug
                    console.log( 'Saved message: ' + result._id );
                    
                    // Distribute
                    for( var c = 0; c < socket.clients.length; c++ ) {
                        socket.clients[c].send( JSON.stringify( {
                            action: 'create',
                            data: result
                        } ) );
                    }                                    
                } );                                            
                
                break;
        }
    } );
    
} );

// Listen
server.on( 'request', app );
server.listen( environment.port, function() {
    console.log( environment.url );
} );
