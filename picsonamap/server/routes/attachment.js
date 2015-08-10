var express = require( 'express' );
var fs = require( 'fs' );
var multer = require( 'multer' ); 
var path = require( 'path' );
var uuid = require( 'uuid' );

var router = express.Router();

// Constants
var EXTERNAL_PATH = 'uploads';
var INTERNAL_PATH = '../public/uploads';
var UPLOAD_FIELD = 'attachment';
var UPLOAD_PATH = 'public/uploads';

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

// Get list of file uploads
router.get( '/attachment', function( req, res ) {
	fs.readdir( path.join( __dirname, INTERNAL_PATH ), function( error, files ) {
		var list = null;
		var name = null;
		
		list = [];
		
		for( var f = 0; f < files.length; f++ )
		{
			name = path.join( __dirname, INTERNAL_PATH, files[f] );
			
			// Not a directory
			if( !fs.statSync( name ).isDirectory() )
			{
				// Not a dot file
				if( files[f].indexOf( '.' ) > 0 )
				{
					list.push( files[f] );					
				} 
			}
		}
		
		res.json( {
			files: list,
			full: '/' + EXTERNAL_PATH + '/',
			path: EXTERNAL_PATH	
		} );
	} );
} );

// Get a specific file by ID
router.get( '/attachment/:id', function( req, res ) {	
	// Look for matching file in uploads
	// Do not assume file extension
	fs.readdir( path.join( __dirname, INTERNAL_PATH ), function( error, files ) {
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
			res.sendFile( path.join( __dirname, INTERNAL_PATH, files[f] ) );			
		}		
	} );
} );

// Upload a file
// Upload directory must already exist
// Return details on accessing image upload
router.post( '/attachment', upload.single( UPLOAD_FIELD ), function( req, res ) {
	var end = null;
	var id = null;
	
	end = req.file.filename.indexOf( '.' );
	id = req.file.filename.substring( 0, end )
	
	req.logger.info( 'Upload: ' + id );
	
	res.json( {
		file: req.file.filename,
		full: '/' + EXTERNAL_PATH + '/' + req.file.filename,
		id: id,
		path: EXTERNAL_PATH
	} );	
} );

// Remove a file by ID
// ID is file name without extension
router.delete( '/attachment/:id', function( req, res ) {
	fs.readdir( path.join( __dirname, INTERNAL_PATH ), function( error, files ) {
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
			fs.unlink( path.join( __dirname, INTERNAL_PATH, files[f] ), function() {
				res.send( 'Done.' );	
			} )			
		}		
	} );	
} );

module.exports = router;
