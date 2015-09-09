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

// Models
var Photon = require( path.join( __dirname, 'models/photon' ) );

// Sockets
var server = http.createServer();
var socket = new ws.Server( {
    server: server
} );

// Connection
socket.on( 'connection', function connection( connection ) {
    console.log( 'Connection.' );    
} );

// Web
var app = express();

// Middleware
app.use( parser.json() );
app.use( parser.urlencoded( { 
	extended: false 
} ) );

// Add functionality
app.use( function( req, res, next ) {
    req.clients = socket.clients;
    next();
} );

// Static
app.use( '/', express.static( 'public' ) );

// Routes
app.use( '/api', require( './routes/photon.js' ) );

// Listen
server.on( 'request', app );
server.listen( environment.port, function() {
    console.log( environment.url );
} );
