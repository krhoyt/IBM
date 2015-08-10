var router = require( 'express' ).Router();

// Log all requests
router.all( '*', function( req, res, next ) {
	req.logger.info( 'Received request to: ' + req.url );
	next();
} );

module.exports = exports = router;
