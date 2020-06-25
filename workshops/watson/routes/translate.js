var express = require( 'express' );
var request = require( 'request' );

var PATH_IDENTIFY = '/v2/identify';
var PATH_LANGUAGES = '/v2/identifiable_languages';
var PATH_TRANSLATE = '/v2/translate';

// Router
var router = express.Router();

// Identify the language of provided content
router.post( '/identify', function( req, res ) {
	var hash = null;
    var url = null;
    
    // API endpoint
    url =
        req.config.translate.url +
        PATH_IDENTIFY;
    
    // Authentication
    // HTTP Basic
	hash = new Buffer( 
		req.config.translate.username + 
		':' + 
		req.config.translate.password
	).toString( 'base64' );
	
	request( {
		method: 'POST',
		url: url,	
		headers: {
            'Accept': 'application/json',
            'Content-Type': 'text/plain',
			'Authorization': 'Basic ' + hash
		},
        body: req.body.text
	}, function( err, result, body ) {
        // Client gets unparsed body content
		res.send( body );
	} );    
} );

// Translation
router.post( '/to', function( req, res ) {
	var hash = null;
    var url = null;
    
    // API endpoint
    url =
        req.config.translate.url +
        PATH_TRANSLATE;
    
    // Authentication
    // HTTP Basic
	hash = new Buffer( 
		req.config.translate.username + 
		':' + 
		req.config.translate.password
	).toString( 'base64' );
	
	request( {
		method: 'POST',
		url: url,	
		headers: {
            'Accept': 'application/json',
			'Authorization': 'Basic ' + hash
		},
        form: {
            source: req.body.source,
            target: req.body.target,
            text: req.body.text
        }
	}, function( err, result, body ) {
        // Client gets unparsed body content
		res.send( body );
	} );
} );

// Identifiable languages
router.get( '/languages', function( req, res ) {
    var hash = null;
    var url = null;
    
    // API endpoint
    url =
        req.config.translate.url +
        PATH_LANGUAGES;    
    
    // Authentication
    // HTTP Basic
	hash = new Buffer( 
		req.config.translate.username + 
		':' + 
		req.config.translate.password
	).toString( 'base64' );    
    
    request( {
        method: 'GET',
        url: url,
        headers: {
            'Authorization': 'Basic ' + hash
        }
    }, function( err, result, body ) {
        // Client gets unparsed body content        
        res.send( body );
    } );
} );

// Test
router.get( '/test', function( req, res ) {
	res.json( {watson: 'Translate'} );
} );
	
// Export
module.exports = router;
