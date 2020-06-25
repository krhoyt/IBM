var cfenv = require( 'cfenv' );
var cors = require( 'cors' );
var express = require( 'express' );
var jsonfile = require( 'jsonfile' );
var parser = require( 'body-parser' );

// Read individual settings
var config = jsonfile.readFileSync( __dirname + '/config.json' );

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
app.use( '/api/visual', require( './routes/visual' ) );

// Cloud Foundry support
// Bluemix
var env = cfenv.getAppEnv();

// Start server
app.listen( env.port, '0.0.0.0', function() {
  // Debug
  console.log( 'Started on: ' + env.port );
} );
