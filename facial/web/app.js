var cfenv = require( 'cfenv' );
var express = require( 'express' );
var jsonfile = require( 'jsonfile' );
var parser = require( 'body-parser' );

// External configuration
config = jsonfile.readFileSync( __dirname + '/config.json' );

// Application
var app = express();

// Middleware
app.use( parser.json( {limit: '50mb'} ) );
app.use( parser.urlencoded( { 
	limit: '50mb',
	extended: false,
	parameterLimit: 50000
} ) );

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
app.use( '/api/storage', require( './routes/storage' ) );
app.use( '/api/watson', require( './routes/watson' ) );

// TODO: Check for relevant directories (classifier, archives)
// TODO: Create if not present

// Bluemix
var env = cfenv.getAppEnv();

// Listen
var server = app.listen( env.port, env.bind, function() {
	// Debug
	console.log( 'Started on: ' + env.port );
} );
