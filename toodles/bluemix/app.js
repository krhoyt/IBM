var cfenv = require( 'cfenv' );
var express = require( 'express' );

// Application
var app = express();

// Static hosting
app.use( '/', express.static( 'public' ) );

// Bluemix
var env = cfenv.getAppEnv();

// Listen
var server = app.listen( env.port, env.bind, function() {
	// Debug
	console.log( 'Started on: ' + env.port );
} );
