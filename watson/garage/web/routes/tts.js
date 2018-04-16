var express = require( 'express' );
var request = require( 'request' );

// Router
var router = express.Router();

// Access token
router.get( '/tts/token', function( req, res ) {
  var hash = null;
  
  // Authentication
  // HTTP Basic
  hash = new Buffer( 
    req.config.tts.username + 
    ':' + 
    req.config.tts.password
  ).toString( 'base64' );
  
  // Request token
  request( {
    method: 'GET',
    url: req.config.tts.stream + '?url=' + req.config.tts.url, 
    headers: {
      'Authorization': 'Basic ' + hash
    }
  }, function( err, result, body ) {
    res.send( body );
  } );
} );

// Test
router.get( '/tts/test', function( req, res ) {
  res.json( {watson: 'Text-to-Speech'} );
} );
  
// Export
module.exports = router;
