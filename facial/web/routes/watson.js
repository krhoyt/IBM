var archiver = require( 'archiver' );
var express = require( 'express' );
var fs = require( 'fs' );
var multer = require( 'multer' );
var path = require( 'path' );
var randomstring = require( 'randomstring' );
var request = require( 'request' );

// Router
var router = express.Router();

// Build custom classifier
router.get( '/build', async function( req, res ) {
  // Turn directory structure into class model
  var list = path.join( __dirname, '/../public/classifier' );
  var files = fs.readdirSync( list );
  var classes = [];
  var count = 0;
  
  // Directory names are class names
  // Created by user-provided name
  for( var f = 0; f < files.length; f++ ) {
    var file = path.join( __dirname, '/../public/classifier/', files[f] );
    var stats = fs.statSync( file );

    if( stats.isDirectory() ) {
      classes.push( {
        name: files[f],
        file: files[f].replace( ' ', '_' )
      } );
    }
  }

  // Archive (zip) images in each of the directories
  // Each directory gets own archive
  // Images are appended to root of archive
  for( var c = 0; c < classes.length; c++ ) {
    await zip( classes[c] );
  }

  // Check for existing classifier
  // Lite plan only includes single classifier
  request( {
    url: req.config.watson.url + '?verbose=true&version=2018-03-19',
    method: 'GET',
    auth: {
      'user': req.config.watson.username,
      'password': req.config.watson.password      
    }
  }, function( error, response, body ) {
    var data = JSON.parse( body );

    // There is an existing classifier
    if( data.classifiers.length > 0 ) {
      // Delete the existing classifier
      request( {
        url: req.config.watson.url + '/' + data.classifiers[0].classifier_id + '?version=2018-03-19',
        method: 'DELETE',
        auth: {
          'user': req.config.watson.username,
          'password': req.config.watson.password                    
        }
      }, function( error, response, body ) {
        // Build out request
        // Form data will be modified based on available classes
        var options = {
          url: req.config.watson.url + '?version=2018-03-19',
          method: 'POST',
          auth: {
            'user': req.config.watson.username,
            'password': req.config.watson.password                    
          },
          formData: {
            name: 'facial'
          }        
        };
      
        // Specify archive file streams
        // Archives get positive labeling
        // No negatives will be provided
        // Means at least two positives are needed
        for( var c = 0; c < classes.length; c++ ) {
          var file = path.join( __dirname, '/../public/classifier/' + classes[c].file + '_positive_examples.zip' );
          options.formData[classes[c].file + '_positive_examples'] = fs.createReadStream( file );
        }

        // Call Watson to build custom classifier
        request( options, function( error, response, body ) {
          res.send( body );
        } );
      } );
    } else {
      // No classifier present
      // Just build it out
      // TODO: Make reusable function

      // Build out request
      // Form data will be modified based on available classes      
      var options = {
        url: req.config.watson.url + '?version=2018-03-19',
        method: 'POST',
        auth: {
          'user': req.config.watson.username,
          'password': req.config.watson.password                    
        },
        formData: {
          name: 'facial'
        }        
      };
    
      // Specify archive file streams
      // Archives get positive labeling
      // No negatives will be provided
      // Means at least two positives are needed      
      for( var c = 0; c < classes.length; c++ ) {
        var file = path.join( __dirname, '/../public/classifier/' + classes[c].file + '_positive_examples.zip' );
        options.formData[classes[c].file + '_positive_examples'] = fs.createReadStream( file );
      }

      // Call Watson to build custom classifier      
      request( options, function( error, response, body ) {
        res.send( body );
      } );
    }
  } );
} );

// Classify one or more images
// Against custom classifier only
// Upload one or more PNG image files
router.post( '/classify', multer( {
  storage: multer.diskStorage( {
    destination: 'public/classifier',
    filename: function( req, file, cb ) {
      cb( null, randomstring.generate() + '.png' );
    }    
  } ) 
} ).array( 'file' ), function( req, res ) {
  // More than one file uploaded
  // Must be uploaded as a single archive
  if( req.files.length > 1 ) {
    // Archive to hold images    
    var destination = path.join( __dirname, '/../public/classifier', randomstring.generate() + '.zip' );
    var output = fs.createWriteStream( destination );
  
    // Create zip archive
    var archive = archiver( 'zip', {
      zlib: {level: 9}
    } );  

    // When finished creating archive
    // Send to Watson for classification
    archive.on( 'finish', function() {
      request( {
        url: req.config.watson.classify + '?version=2018-03-19',
        method: 'POST',
        auth: {
          'user': req.config.watson.username,
          'password': req.config.watson.password                    
        },
        formData: {
          classifier_ids: req.body.classifier,
          images_file: fs.createReadStream( destination )
        }
      }, function( error, response, body ) {
        // Remove uploaded images
        for( var f = 0; f < req.files.length; f++ ) {
          var image = path.join( __dirname, '/../public/classifier/', req.files[f].filename );
          fs.unlinkSync( image );
        }

        // Remove archive file
        fs.unlinkSync( destination );

        // Send results to client
        res.send( body );
      } );      
    } );

    // Tell archive utility where to put the file
    archive.pipe( output );

    // Add the uploaded images to the archive
    for( var f = 0; f < req.files.length; f++ ) {
      var image = path.join( __dirname, '/../public/classifier/', req.files[f].filename );
      archive.append( fs.createReadStream( image ), {name: req.files[f].filename} );
    }

    // Close stream (build archive)
    archive.finalize();
  } else {
    // Only a single image was uploaded
    // TODO: Make into reusable function
    var source = path.join( __dirname, '/../public/classifier/', req.files[0].filename );

    // Upload to Watson for custom classification
    request( {
      url: req.config.watson.classify + '?version=2018-03-19',
      method: 'POST',
      auth: {
        'user': req.config.watson.username,
        'password': req.config.watson.password                    
      },
      formData: {
        classifier_ids: req.body.classifier,
        images_file: fs.createReadStream( source )
      }
    }, function( error, response, body ) {
      // Remove uploaded files
      for( var f = 0; f < req.files.length; f++ ) {
        var image = path.join( __dirname, '/../public/classifier/', req.files[f].filename );
        fs.unlinkSync( image );
      }

      // Send results to client
      res.send( body );
    } );
  }
} );

// Classifier namne
router.get( '/classifiers', function( req, res ) {
  // Get a list of classifiers from Watson
  request( {
    url: req.config.watson.url + '?verbose=true&version=2018-03-19',
    method: 'GET',
    auth: {
      'user': req.config.watson.username,
      'password': req.config.watson.password
    }
  }, function( error, response, body ) {
    res.send( body );
  } );
} );

// Status
router.get( '/status/:classifier', function( req, res ) {    
  // Check the status of a specific classifier
  // Average time to build is ten minutes
  request( {
    url: req.config.watson.url + '/' + req.params.classifier + '?version=2016-05-20',
    method: 'GET',
    auth: {
      'user': req.config.watson.username,
      'password': req.config.watson.password
    }    
  }, function( error, response, body ) {
    res.send( body );
  } );
} );

// Text to Speech
router.get( '/tts', function( req, res ) {
  // Request token for us eby client
  request( {
    method: 'GET',
    url: req.config.watson.tts.stream + '?url=' + req.config.watson.tts.url, 
    auth: {
      username: req.config.watson.tts.username,
      password: req.config.watson.tts.password
    }
  }, function( err, result, body ) {
    res.send( body );
  } );  
} );

// Test
router.get( '/test', function( req, res ) {    
  res.json( {watson: 'Visual'} );
} );

// Build archive using async/await
// Make promisified approach more procedural in appearance
async function zip( content ) {
  // Source for archive
  // Destination for archive
  // Auotmatically gets positive label
  // No negatives are provided
  // Must then send at least two positive example archives
  var source = path.join( __dirname, '/../public/classifier/', content.name );
  var destination = path.join( __dirname, '/../public/classifier/' + content.file + '_positive_examples.zip' );
  var output = fs.createWriteStream( destination );

  // Archive all PNG files in specified source directory
  // Images are placed on archive root
  var archive = archiver( 'zip', {
    zlib: {level: 9}
  } );  
  archive.pipe( output );
  archive.glob( '*.png', {cwd: source} );
  archive.finalize();
}

// Export
module.exports = router;
