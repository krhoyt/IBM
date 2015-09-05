// Packages
var express = require( 'express' );
var path = require( 'path' );

// Express
var app = express();

// Static routing
// To "web" directory in lab folder
app.use( express.static( path.join( __dirname, '..', 'web' ) ) );

// Start server
var server = app.listen( 3000, function () {
  console.log( 'Ready on 3000.' );
} );
