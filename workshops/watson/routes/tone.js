var express = require( 'express' );
var request = require( 'request' );

var VERSION = '/v3/tone?version=2016-05-19';

// Router
var router = express.Router();

// Analyze the tones
router.post( '/analyze', function( req, res ) {
	var hash = null;
	
    // Authentication
    // HTTP Basic
	hash = new Buffer( 
		req.config.tone.username + 
		':' + 
		req.config.tone.password
	).toString( 'base64' );
	
    // Request analysis
	request( {
		method: 'POST',
		url: req.config.tone.url + VERSION,	
		headers: {
			'Authorization': 'Basic ' + hash,
            'Content-Type': 'application/json'
		},
        body: JSON.stringify( {
            text: req.body.content
        } )
	}, function( err, result, body ) {
		res.send( body );
	} );
} );

// Test
router.get( '/test', function( req, res ) {
	res.json( {watson: 'Tone Analyzer'} );
} );
	
// Export
module.exports = router;
