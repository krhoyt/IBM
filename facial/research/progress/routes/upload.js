var express = require( 'express' );
var fs = require( 'fs' );
var multer = require( 'multer' );
var randomstring = require( 'randomstring' );

// Router
var router = express.Router();

// Upload storage options
// Unique name with extension
var storage = multer.diskStorage( {
  destination: 'uploads',
    filename: function( req, file, cb ) {
      cb( null, randomstring.generate() + '.jpg' );
    }
} );

// Upload handler
var upload = multer( {
  storage: storage
} );

// Image upload
router.post( '/image', upload.single( 'attachment' ), function( req, res ) {
  res.send( req.file.path );
} );

// Test
router.get( '/test', function( req, res ) {    
  res.json( {facial: 'Upload testing.'} );
} );
  
// Export
module.exports = router;
