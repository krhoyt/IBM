var express = require( 'express' );
var path = require( 'path' );

var app = express();

app.use( express.static( path.join( __dirname, '..', 'web' ) ) );

var server = app.listen( 3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log( 'Listening at: http://%s:%s', host, port );
} );
