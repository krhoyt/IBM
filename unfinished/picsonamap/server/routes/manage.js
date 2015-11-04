var express = require( 'express' );
var fs = require( 'fs' );
var jsonfile = require( 'jsonfile' );
var path = require( 'path' );
var sizeof = require( 'image-size' );
var uuid = require( 'uuid' );

// TODO: Make sure upload directory exists

// Constants
var LOCATION_DATA = 'locations.json';
var LOCATION_PATH = '../';
var LOCATION_SRC = '../locations';
var UPLOAD_PATH = '../public/uploads';

var router = express.Router();

// Rebuild the database
// Will remove the entire database
// Then repopulate with dummy content
router.get( '/reset', function( req, res ) {
	var local = null;
	var full = null;
	
	req.logger.info( 'Cleaning up file system.' );
	
	local = fs.readdirSync( path.join( __dirname, UPLOAD_PATH ) );
		
	for( var f = 0; f < local.length; f++ )
	{
		full = path.join( __dirname, UPLOAD_PATH, local[f] );		
		
		// Not a directory
		if( !fs.statSync( full ).isDirectory() )
		{
			// Delete file
			fs.unlinkSync( full );
		}		
	}
	
	req.logger.info( 'Removed ' + f + ' files.' );	
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
			var dimensions = null;
			var documents = null;
			var locations = null;
			var original = null;
			var start = null;
			
			if( error )
			{
				req.logger.info( 'Problem with bulk delete.' );
				req.logger.info( 'Message: ' + error );
			}
			
			req.logger.info( 'Bulk delete complete.' );
		
			// Get default documents
			locations = jsonfile.readFileSync( path.join( __dirname, LOCATION_PATH, LOCATION_DATA ) );			
			
			// Bulk document insert holder
			documents = [];
			
			for( var p = 0; p < locations.length; p++ )
			{
				// Find extension
				start = locations[p].source.lastIndexOf( '.' );
				
				// Give new name based on UUID
				locations[p].extension = locations[p].source.substring( start );
				locations[p].uuid = uuid.v4();
				locations[p].uuid = locations[p].uuid.replace( /-/g, '' );
				
				// Determine content type
				if( locations[p].source.lastIndexOf( 'jpg' ) > 0 )
				{
					locations[p].content = 'image/jpeg';
				} else {
					locations[p].content = 'image/png';
				}
				
				// Copy original to uploads
				original = path.join( __dirname, LOCATION_SRC, locations[p].source );
				
				fs.linkSync( 
					original,
					path.join( __dirname, UPLOAD_PATH, locations[p].uuid + locations[p].extension ) 
				);
				
				// Image dimensions
				// Used by user interface
				dimensions = sizeof( original );
				
				// Push document data object
				// Used for bulk insert
				documents.push( {
					height: dimensions.height,
					latitude: locations[p].latitude,
					longitude: locations[p].longitude,
					timestamp: Date.now(),	
					width: dimensions.width
				} );
			}
							
			// Bulk insert new documents
			req.data.bulk( {docs: documents}, function( error, body ) {
				var count = null;
				var data = null;
				
				if( error )
				{
					req.logger.info( 'Problem creating defaults.' );
					req.logger.info( 'Message: ' + error.message );
				}
				
				// Track updates
				count = 0;
				
				// Attach files for each document
				// Response array same order as bulk array
				for( var d = 0; d < body.length; d++ )
				{
					// Read the image file contents
					data = fs.readFileSync( path.join( __dirname, UPLOAD_PATH, locations[d].uuid + locations[d].extension ) );
					
					// Asynchronous attachment insert
					req.data.attachment.insert( 
						body[d].id, 
						locations[d].uuid + locations[d].extension, 
						data, 
						locations[d].content, 
						{rev: body[d].rev}, 
						function( error, result ) {
							if( error )
							{
								req.logger.info( 'Problem creating attachments.' );
								req.logger.info( 'Message: ' + error.message );
							}
							
							req.logger.info( 'Completed: ' + result.id );						
							
							// Increment updates
							count = count + 1;
							
							// If all updated
							// Tell user
							if( count == body.length )
							{
								res.send( 'Done.' );
							}
						}
					);
				}
			} );			
		} );
  	} );
} );

module.exports = router;
