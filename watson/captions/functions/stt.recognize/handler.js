// Libraries
var fs = require( 'fs' );
var multipart = require( 'parted' ).multipart;
var request = require( 'request' );
var sts = require( 'string-to-stream' );

// Main
function main( params ) {

  // Wait for response from service calls
  // Otherwise function will make the request
  // And promptly shut down and destroy itself
  // Without ever having received a response
  return new Promise( ( resolve, reject ) => {
    // Decode the stream into a string
    let decoded = new Buffer( params.__ow_body, 'base64' );
    let stream = sts( decoded );

    // Disk management
    var options = {
      limit: 30 * 1024,
      diskLimit: 30 * 1024 * 1024
    };

    // Parse the parts of the string
    // Will have demarkation per HTTP specification
    var parser = new multipart( params.__ow_headers[ 'content-type' ], options ), parts = {};

    // Whoops!
    parser.on( 'error', function( err ) {
      console.log( 'parser error', err );
    } );

    // Put parts into key/value object
    parser.on( 'part', function( field, part ) {
      parts[field] = part;
    } );

    // Parsing is complete
    // Send data to Watson
    parser.on( 'end', function() {

      // Request to Watson
      // Speech to Text
      // Uploaded audio file
      // Audio file is key named "file"
      // Include speaker labels
      // Also supports various audio types
      request( {
        method: 'POST',
        url: params.API_URL + '?speaker_labels=true',
        auth: {
          username: params.API_USERNAME,
          password: params.API_PASSWORD
        },
        headers: {
          'Content-Type': parts.type
        },
        body: fs.createReadStream( parts.file )
      }, function( err, result, body ) {
        
        // Resolve enclosing promise
        // Response from Watson will be JSON
        resolve( {
          headers: {
            'Content-Type': 'application/json'
          },
          body: body
        } );
      } );
    } );

    stream.pipe( parser );
  } );
}

exports.main = main;
