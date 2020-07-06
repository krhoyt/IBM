var express = require( 'express' );
var request = require( 'request' );

// Router
var router = express.Router();

// Access token
router.get( '/stt/token', function( req, res ) {
	var hash = null;
	
  // Authentication
  // HTTP Basic
	hash = new Buffer( 
		req.config.stt.username + 
		':' + 
		req.config.stt.password
	).toString( 'base64' );
	
  // Request token
	request( {
		method: 'GET',
		url: config.stt.stream + '?url=' + req.config.stt.url,	
		headers: {
			'Authorization': 'Basic ' + hash
		}
	}, function( err, result, body ) {
		res.send( body );
	} );
} );

// Test
router.get( '/stt/test', function( req, res ) {
	res.json( {watson: 'Speech-To-Text'} );
} );
	
// Export
module.exports = router;
