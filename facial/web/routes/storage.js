var express = require( 'express' );
var fs = require( 'fs-extra' );
var multer = require( 'multer' );
var path = require( 'path' );
var randomstring = require( 'randomstring' );

// Router
var router = express.Router();

// List class details
router.get( '/class', function( req, res ) {
  // Path to custom class directory
  var list = path.join( __dirname, '/../public/classifier/', req.query.name );
  
  // Read files in custom class
  fs.readdir( list, function( err, files ) {
    var result = [];

    // Check each file to see if it is a file
    // Not a directory or other hidden
    for( var f = 0; f < files.length; f++ ) {
      var file = path.join( __dirname, '/../public/classifier/', req.query.name, files[f] );
      var stats = fs.statSync( file );

      // Image file in custom class
      // Add to results
      if( stats.isFile() ) {
        result.push( files[f] );
      }
    }

    // Send results as JSON
    res.json( result );
  } );
} );

// Remove class from storage
router.delete( '/class/:id', function( req, res ) {
  // Look for archive of custom class
  var underscored = req.params.id.replace( ' ', '_' );
  var archive = path.join( __dirname, '/../public/classifier/', underscored + '_positive_examples.zip' );
  
  // Get details for archive path
  fs.stat( archive, function( err, stat ) {
    // Archive exists
    // Delete archive
    if( !err ) {
      fs.unlinkSync( archive );
    }

    // Check for parent folder of custom class
    var folder = path.join( __dirname, '/../public/classifier/', req.params.id );

    // Remove directory and enclosed images
    fs.remove( folder, function() { 
      // Report which class was deleted
      res.json( {remove: req.params.id} );
    } );    
  } );
} );

// List directories (classes)
router.get( '/classes', function( req, res ) {
  // Path to classifier directory
  // Classes represented by directory
  var list = path.join( __dirname, '/../public/classifier' );

  // Read the directory contents
  fs.readdir( list, function( err, files ) {
    var result = {};

    // Look through resulting list
    for( var f = 0; f < files.length; f++ ) {
      var file = path.join( __dirname, '/../public/classifier/', files[f] );
      var stats = fs.statSync( file );

      // If entry is a directory
      // Must be class name
      if( stats.isDirectory() ) {
        // Get files inside directory
        // Hash class name with first image file
        var images = fs.readdirSync( file );
        result[files[f]] = images[0];
      }
    }

    // Return classes with example image
    res.json( result );
  } );
} );

// Upload faces
router.post( '/upload', multer( {
  storage: multer.diskStorage( {
    destination: 'public/classifier',
    filename: function( req, file, cb ) {
      cb( null, randomstring.generate() + '.png' );
    }    
  } ) 
} ).array( 'file' ), function( req, res ) {
  // Path to classifier directory
  var name = path.join( __dirname, '/../public/classifier/', req.body.name );

  // Check to see if class exists
  fs.stat( name, function( err, stats ) {    
    // Make directory if not existing
    if( !stats ) {
      fs.mkdirSync( name );
    }

    // Move each of the uploaded files to class directory
    for( var f = 0; f < req.files.length; f++ ) {
      var source = path.join( __dirname, '/../', req.files[f].path );
      var destination = path.join( name, req.files[f].filename );

      fs.renameSync( source, destination );
    }

    // Confirm upload to client
    res.json( {
      storage: 'Upload',
      class: req.body.name,
      image: req.files[0].filename
    } );    
  } );
} );

// Upload archive
// Used for testing well-formed upload
// Accepts pretty much any upload
router.post( '/archive', multer( {
  storage: multer.diskStorage( {
    destination: 'public/archives',
    filename: function( req, file, cb ) {
      cb( null, randomstring.generate() + '.zip' );
    }    
  } ) 
} ).any(), function( req, res ) {
  // Comfirm upload with client
  res.json( {storage: 'Archive'} );    
} );

// Delete face
router.delete( '/image', function( req, res ) {
  // Path to image file
  var name = path.join( __dirname, '/../public/classifier/', req.body.class, req.body.file );

  // Remove file from system
  fs.unlink( name, function( err ) {
    // Confirm with client
    res.json( {storage: 'Delete'} );
  } );
} );

// Test
router.get( '/test', function( req, res ) {    
  res.json( {storage: 'Local'} );
} );

// Export
module.exports = router;
