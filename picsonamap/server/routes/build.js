var express = require( 'express' );
var jsonfile = require( 'jsonfile' );
var path = require( 'path' );
var router = express.Router();

var LOCATION_DATA = 'locations.json';
var LOCATION_PATH = '../';

// Rebuild the database
// Will remove the entire database
// Then repopulate with dummy content
router.get( '/build', function( req, res ) {	
	req.logger.info( 'Requesting existing documents.' );
	
	// List out all documents
	req.data.list( function( error, body ) {
		var bulk = null;
		
		if( error ) 
		{
			req.logger.info( 'Error listing documents.' );
			req.logger.info( 'Message: ' + error.message );			
		}

		// Build bulk delete
		bulk = [];

		// Iterate over document list
		req.logger.info( 'Deleting existing documents.' );
		body.rows.forEach( function( document ) {
			// Not design documents
			if( document.id.substring( 0, 7 ) != '_design' ) 
			{
				// Document to delete
				bulk.push( {
					_id: document.id,
					_rev: document.value.rev,
					_deleted: true
				} );
			}
		} );
		
		// Bulk delete
		req.data.bulk( {docs: bulk}, function( error, body ) {
			var locations = null;
			
			if( error )
			{
				req.logger.info( 'Problem with bulk delete.' );
				req.logger.info( 'Message: ' + error );
			}
			
			req.logger.info( 'Bulk delete complete.' );
		
			// Get default documents
			locations = jsonfile.readFileSync( path.join( __dirname, LOCATION_PATH, LOCATION_DATA ) );			
			
			res.json( locations );			
		} );
  	} );
} );

module.exports = router;
