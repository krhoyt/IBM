var fs = require( 'fs' );
var multipart = require( 'parted' ).multipart;
var request = require( 'request' );
var sts = require( 'string-to-stream' );

function main( params ) {
  return new Promise( ( resolve, reject ) => {
    let decoded = new Buffer( params.__ow_body, 'base64' );
    let stream = sts( decoded );

    var options = {
      limit: 30 * 1024,
      diskLimit: 30 * 1024 * 1024
    };

    var parser = new multipart( params.__ow_headers[ 'content-type' ], options ), parts = {};
    parser.on( 'error', function( err ) {
      console.log( 'parser error', err );
    } );

    parser.on( 'part', function( field, part ) {
      parts[field] = part;
    } );

    parser.on( 'end', function() {
      // var file = fs.readFileSync( parts.file );

      var form = {
        file: fs.createReadStream( parts.file )
      };
	  
	  if( parts.classifiers ) {
        form.classifier_ids = parts.classifiers;
	  }
      
	  console.log( parts );
	  
      request( {
        method: 'POST',
        url: params.API_URL + '?version=' + params.API_VERSION,
        auth: {
          username: params.API_USERNAME,
          password: params.API_PASSWORD
        },
        formData: form
      }, function( err, result, body ) {
        resolve( {
          headers: {
            'Content-Type': 'application/json'
          },
          body: body
        } );
      } );

      /*
      var base64File = new Buffer( file ).toString( 'base64' );

      resolve( {
        statusCode: 200,
        headers: { 'Content-Type': 'image/png' },
        body: base64File
      } );
      */
    } );

    stream.pipe( parser );
  } );
}

exports.main = main;
