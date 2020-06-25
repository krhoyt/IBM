var express = require( 'express' );
var request = require( 'request' );

var PATH_COMBINED = '/url/URLGetCombinedData';

// Router
var router = express.Router();

// Identify the language of provided content
router.post( '/language', function( req, res ) {
	request( {
		method: 'POST',
		url: req.config.alchemy.url + PATH_COMBINED,	
        form: {
            apikey: req.config.alchemy.api_key,
            outputMode: 'json',
            url: req.body.url
        }
	}, function( err, result, body ) {
        // Client gets unparsed body content
		res.send( body );
	} );    
} );

// Test
router.get( '/test', function( req, res ) {
	res.json( {watson: 'Language'} );
} );
	
// Export
module.exports = router;
