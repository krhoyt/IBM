// Packages
var parser = require( 'body-parser' );
var cfenv = require( 'cfenv' );
var express = require( 'express' );
var http = require( 'http' );
var jsonfile = require( 'jsonfile' );
var mongoose = require( 'mongoose' );
var path = require( 'path' );
var ws = require( 'ws' );

// Constant
var BARCODE_REMOVE = 'barcode_remove';
var BARCODE_SHOW = 'barcode_show';
var BUILDINGS_VALUE = 'buildings';
var CHAT_CREATE = 'create_chat';
var CHAT_READ_ALL = 'read_all_chat';
var PETROLPAL_VALUE = 'petropal';
var PHOTOCELL_VALUE = 'photocell';
var TETRIS_DOWN = 'tetris_down';
var TETRIS_JOIN = 'tetris_join';
var TETRIS_UP = 'tetris_up';

// Environment
var environment = cfenv.getAppEnv();
var configuration = jsonfile.readFileSync( path.join( __dirname, 'configuration.json' ) );

// Database
mongoose.connect( configuration.compose );

mongoose.connection.on( 'connected', function() {
    console.log( 'Connected to Compose.' );
} );

// Models
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
            case CHAT_READ_ALL:
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
            case CHAT_CREATE:
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
                            action: body.action,
                            data: result
                        } ) );
                    }                                    
                } );                                            
                
                break;
            
            // Tetris
            case TETRIS_JOIN:
            case TETRIS_UP:
            case TETRIS_DOWN:
                // Distribute
                for( var c = 0; c < socket.clients.length; c++ ) {
                    socket.clients[c].send( message );
                }         
                
                break;
            
            // Photocell
            case PHOTOCELL_VALUE:
                // Distribute
                for( var c = 0; c < socket.clients.length; c++ ) {
                    socket.clients[c].send( message );
                }         
                
                break;                
                
            // PetrolPal
            case PETROLPAL_VALUE:
                // Distribute
                for( var c = 0; c < socket.clients.length; c++ ) {
                    socket.clients[c].send( message );
                }         
                
                break;     
                
            // Barcode
            case BARCODE_REMOVE:
            case BARCODE_SHOW:
                // Distribute
                for( var c = 0; c < socket.clients.length; c++ ) {
                    socket.clients[c].send( message );
                }         
                
                break;                     
                
            // Buildings
            case BUILDINGS_VALUE:
                // Distribute
                for( var c = 0; c < socket.clients.length; c++ ) {
                    socket.clients[c].send( message );
                }         
                
                break;                                     
        }
    } );
    
} );

// Listen
server.on( 'request', app );
server.listen( environment.port, function() {
    console.log( environment.url );
} );
