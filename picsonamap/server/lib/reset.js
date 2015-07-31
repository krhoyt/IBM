// Libraries
var fs = require( 'fs-extra' );
var path = require( 'path' );
var router = require( 'express' ).Router();

// Constants
var DEFAULT_IMAGES_PATH = '../locations/';
var LOCATIONS_PATH = '../locations.json';
var USER_IMAGES_PATH = '../public/images/';

// Module
var Reset = {
	
	// Reset the demo content
	buildDefault: function( req, res ) {
		var locations = null;
		var query = null;
		
		/*
		 * Image files
		 */
		
		// Remove previous uploads
		fs.removeSync(
			path.join( __dirname, USER_IMAGES_PATH )	
		);
		
		// Make the directory again
		fs.ensureDirSync( 
			path.join( __dirname, USER_IMAGES_PATH )
		);
		
		// Copy new default images
		fs.copySync(
			path.join( __dirname, DEFAULT_IMAGES_PATH ),
			path.join( __dirname, USER_IMAGES_PATH )
		);
		
		/*
		 * Image records
		 */
		
		// Get existing
		query = req.data.Query.ofType( 'Image' );
		
		query.find().done( function( images ) {
			req.logger.info( 'Found images.' );
			
			Reset.deleteImageRecords( req, images ).then( function() {
				req.logger.info( 'Existing records being cleared ...' );	
				
				// Default image details
				locations = fs.readJsonSync( 
					path.join( __dirname, LOCATIONS_PATH )
				);		
				
				// Save to Cloudant
				Reset.saveImageRecords( req, locations ).then( function() {
					req.logger.info( 'Records being saved ...' );
					
					// Tell user we are done
					res.send( 'Reset complete.' );						
				} );				
			} );
		} );	
	},
	
	// Just a test
	sayHello: function( req, res ) {
		res.send( 'Hello (from Node)!' );
	},
	
	// Promise Anti-Pattern
	// Collection Kerfuffle
	// http://stackoverflow.com/questions/24660096/correct-way-to-write-loops-for-promise
	deleteImageRecords: function( request, records ) {
	    return records.reduce( function( promise, record ) {
	        return promise.then( function() {				
				// Delete image record
	            return record.del().done( function( result ) {
	                request.logger.info( 'Deleted: ' + result );
	            } );
	        } );
	    }, Promise.resolve() );		
	},
	
	saveImageRecords: function( request, records ) {
	    return records.reduce( function( promise, record ) {
	        return promise.then( function() {
				var image = null;
				
				// Build image record
				image = request.data.Object.ofType( 'Image', {
					source: record.source,
					latitude: record.latitude,
					longitude: record.longitude	
				} );
				
				// Save image record
	            return image.save().done( function( result ) {
	                request.logger.info( result.get( 'source' ) );
	            } );
	        } );
	    }, Promise.resolve() );
	}
};

// Routes
router.get( '/build', Reset.buildDefault );
router.get( '/hello', Reset.sayHello );

module.exports = exports = router;
