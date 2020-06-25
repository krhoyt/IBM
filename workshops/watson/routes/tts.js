var express = require( 'express' );
var request = require( 'request' );

var WATSON_TOKEN = 'https://stream.watsonplatform.net/authorization/api/v1/token';
var WATSON_VOICES = 'https://stream.watsonplatform.net/text-to-speech/api/v1/voices';

// Router
var router = express.Router();

// Access token
router.get( '/token', function( req, res ) {
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
		url: WATSON_TOKEN + '?url=' + req.config.tts.url,	
		headers: {
			'Authorization': 'Basic ' + hash
		}
	}, function( err, result, body ) {
		res.send( body );
	} );
} );

// Voices
router.get( '/voices', function( req, res ) {
	var hash = null;
	
    // Authentication
    // HTTP Basic
	hash = new Buffer( 
		req.config.tts.username + 
		':' + 
		req.config.tts.password
	).toString( 'base64' );
	
    // Get voice list
	request( {
		method: 'GET',
		url: WATSON_VOICES + '?url=' + req.config.tts.url,	
		headers: {
			'Authorization': 'Basic ' + hash
		}
	}, function( err, result, body ) {
		res.send( body );
	} );
} );

// Test
router.get( '/test', function( req, res ) {
	res.json( {watson: 'Text-to-Speech'} );
} );
	
// Export
module.exports = router;
