var express = require( 'express' );
var request = require( 'request' );

var PATH_PROFILE = '/v2/profile';

// Router
var router = express.Router();

// What is your personality?
router.post( '/insights', function( req, res ) {
    var hash = null;
	
    // Authentication
    // HTTP Basic
	hash = new Buffer( 
		req.config.personality.username + 
		':' + 
		req.config.personality.password
	).toString( 'base64' );
	
    // Request insight
	request( {
		method: 'POST',
		url: req.config.personality.url + PATH_PROFILE,	
		headers: {
			'Authorization': 'Basic ' + hash,
            'Content-Type': 'text/plain; charset=utf-8'
		},
        body: req.body.content
	}, function( err, result, body ) {
		res.send( body );
	} );
} );

// Test
router.get( '/test', function( req, res ) {
	res.json( {watson: 'Personality'} );
} );
	
// Export
module.exports = router;
