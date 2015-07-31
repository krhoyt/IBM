// Libraries
var fs = require( 'fs-extra' );
var path = require( 'path' );
var router = require( 'express' ).Router();

// Module
var Image = {
	
	// Get all
	getImages: function( req, res ) {
		var query = null;
		
		// Query images
		query = req.data.Query.ofType( 'Image' );
		
		// Find all
		// Return array as JSON
		query.find().done( function( images ) {
			res.json( images );
		} );		
	},

	// Get specific
	getImage: function( req, res ) {
		// By objectId property
		// Return object as JSON
		req.data.Object.withId( req.params.id ).done( function( image ) {
    		res.json( image );
		}, function( error ) {
    		req.logger.info( 'Image not found.' );
		} );		
	}
	
};

// Routes
router.get( '/image', Image.getImages );
router.get( '/image/:id', Image.getImage );

module.exports = exports = router;
