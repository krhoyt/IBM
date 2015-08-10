var express = require( 'express' );
var fs = require( 'fs' );
var multer = require( 'multer' );
var path = require( 'path' );
var uuid = require( 'uuid' );

// Constants
var EXTERNAL_PATH = 'uploads';
var IMAGE_JPEG = 'image/jpeg';
var IMAGE_PNG = 'image/png';
var INTERNAL_PATH = '../public/uploads';
var UPLOAD_FIELD = 'attachment';
var UPLOAD_PATH = 'public/uploads';

var router = express.Router();

// Custom naming for file uploads
var storage = multer.diskStorage( {
	destination: UPLOAD_PATH,
	filename: function( req, file, cb ) {
		var extension = null;
		var name = null;
	  	var start = null;
		
		start = file.originalname.indexOf( '.' );
		extension = file.originalname.substring( start, file.originalname.length );
		
		name = uuid.v4();
		name = name.replace( /-/g, '' );
		  
    	cb( null, name + extension );
	}
} );

// Handle file uploads
var upload = multer( {
	storage: storage	
} );

// Get all picture documents
// Get latest picture document
// Get picture documents within a page
router.get( '/picture', function( req, res ) {
	var params = null;

	// Query parameters		
	params = {
		selector: {
			timestamp: {'$gt': 0}
		},
		sort: [
			{timestamp: 'desc'}
		]
	};
	
	// Support getting only latest record
	// Also supports paging
	if( req.query.limit != undefined )
	{
		params.limit = parseInt( req.query.limit );	
	}
	
	// More support for paging
	// Arguments supplied via query string
	if( req.query.skip != undefined )
	{
		params.skip = parseInt( req.query.skip );	
	}		
	
	// Find using selector
	// Returns documents
	// Not the list function
	req.data.find( params, function( error, body ) {
		if( error )
		{
			req.logger.info( 'Problem reading documents.' );
			req.logger.info( 'Message: ' + error.message );												
		}
		
		res.json( body );
	} );
} );

// Get a specific picture document by ID
router.get( '/picture/:id', function( req, res ) {
	req.data.get( req.params.id, function( error, body ) {
		if( error )
		{
			req.logger.info( 'Problem reading document.' );
			req.logger.info( 'Message: ' + error.message );												
		}
		
		res.json( body );			
	} );
} );

// Upload data and image all at once
router.post( '/picture', upload.single( UPLOAD_FIELD ), function( req, res ) {
	// res.send( req.file.filename + ' ' + req.body.latitude );

	var content = null;

	// Determine content type
	// TOOD: Possible to be more thorough? 
	if( req.file.filename.indexOf( 'jpg' ) > 0 )
	{
		content = IMAGE_JPEG;
	} else {
		content = IMAGE_PNG;
	}
	
	// Read file to attach
	// Make sure we can read the file before attaching
	fs.readFile( path.join( __dirname, INTERNAL_PATH, req.file.filename ), function( error, data ) {
		if( error ) 
		{
			req.info.logger( 'Could not read image file.' );
			req.info.logger( error );
		}		
		
		req.logger.info( 'Read: ' + req.file.filename );
		
		// Add document
		// Let Cloudant create ID
		// Attachment requires ID be provided
		req.data.insert( {
			latitude: parseFloat( req.body.latitude ),
			longitude: parseFloat( req.body.longitude ),
			timestamp: parseInt( req.body.timestamp )
		}, function( error, body, header ) {
			if( error )
			{
				req.logger.info( 'Could not create base document.' );
				req.logger.info( 'Message: ' + error.message );
			}
			
			req.logger.info( 'Document created.' );
			
			// Attach image to newly created document
			req.data.attachment.insert(
				body.id,
				req.file.filename,
				data,
				content,
				{rev: body.rev},
				function( error, body ) {
					if( error )
					{
						req.logger.info( 'Problem associating image.' );
						req.logger.info( 'Message: ' + error.message );
					}
					
					req.logger.info( 'Attachment added to document.' );
					
					res.json( body );
				}	
			);
		} );
	} );
} );

// Create entry using new data
// Existing attachment upload
router.post( '/picture/:id', function( req, res ) {
	req.logger.info( 'Looking for: ' + req.params.id );
	
	// Find file by ID
	fs.readdir( path.join( __dirname, INTERNAL_PATH ), function( error, files ) {
		var content = null;
		var found = false;
		
		for( var f = 0; f < files.length; f++ )
		{
			// Found matching file
			if( files[f].indexOf( req.params.id ) == 0 )
			{
				found = true;
				break;
			}
		} 
		
		// May not be a matching file
		// Send error message or file
		if( !found )
		{
			res.send( '404: File not found.' );
		} else {			
			req.logger.info( 'Found: ' + files[f] );
			
			// Determine content type
			// TOOD: Possible to be more thorough? 
			if( files[f].indexOf( 'jpg' ) > 0 )
			{
				content = IMAGE_JPEG;
			} else {
				content = IMAGE_PNG;
			}
			
			// Read file to attach
			// Make sure we can read the file before attaching
			fs.readFile( path.join( __dirname, INTERNAL_PATH, files[f] ), function( error, data ) {
				if( error ) 
				{
					req.info.logger( 'Could not read image file.' );
					req.info.logger( error );
				}		
				
				req.logger.info( 'Read: ' + files[f] );
				
				// Add document
				// Let Cloudant create ID
				// Attachment requires ID be provided
				req.data.insert( {
					latitude: parseFloat( req.query.latitude ),
					longitude: parseFloat( req.query.longitude ),
					timestamp: parseInt( req.query.timestamp )
				}, function( error, body, header ) {
					if( error )
					{
						req.logger.info( 'Could not create base document.' );
						req.logger.info( 'Message: ' + error.message );
					}
					
					req.logger.info( 'Document created.' );
					
					// Attach image to newly created document
					req.data.attachment.insert(
						body.id,
						files[f],
						data,
						content,
						{rev: body.rev},
						function( error, body ) {
							if( error )
							{
								req.logger.info( 'Problem associating image.' );
								req.logger.info( 'Message: ' + error.message );
							}
							
							req.logger.info( 'Attachment added to document.' );
							
							res.json( body );
						}	
					);
				} );
			} );
		}		
	} );	
} );

module.exports = router;
