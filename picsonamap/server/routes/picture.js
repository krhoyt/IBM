var express = require( 'express' );
var router = express.Router();

// Rough-in for dealing with pictures
router.get( '/picture', function( req, res ) {
	res.send( 'Pictures.' );
} );

module.exports = router;
