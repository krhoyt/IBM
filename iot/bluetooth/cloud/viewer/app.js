var Cloudant = require( 'cloudant' );
var express = require( 'express' );
var jsonfile = require( 'jsonfile' );

// Environment
var configuration = jsonfile.readFileSync( 'config.json' );

// Cloudant
var url = 
  'https://' + 
  configuration.cloudant.username + ':' + 
  configuration.cloudant.password + '@' + 
  configuration.cloudant.account + 
  '.cloudant.com';

Cloudant( url, function( error, cloudant ) {
  if( error ) {
    console.log( error );
  }

  // Specify database
  var bean_db = cloudant.db.use( configuration.cloudant.database );

  // Follow changes
	var stream = bean_db.follow( {
		include_docs: true, 
		since: 'now'
	} );

	// Database change (new reading)
	stream.on( 'change', function( change ) {
    // Send to connected clients
    io.emit( 'bean', change.doc );
	} );
	
	// Start listening
	stream.follow();
} );

// Web
var app = express();

// Static content
app.use( '/', express.static( 'public' ) );

// Server
var server = app.listen( 8080 );

// Socket
var io = require( 'socket.io' )( server );
