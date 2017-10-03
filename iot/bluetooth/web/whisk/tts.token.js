// Use request package
// Default OpenWhisk package
var request = require( 'request' );

function main( params ) {
  // Asynchronous request
  return new Promise( function( resolve, reject ) {
    var hash = null;

    // Authentication
    // HTTP Basic
    hash = new Buffer( 
      params.WATSON_USERNAME + 
      ':' + 
      params.WATSON_PASSWORD
    ).toString( 'base64' );

      // Request token
    request( {
      method: 'GET',
      url: params.WATSON_STREAM + '?url=' + params.WATSON_URL, 
      headers: {
        'Authorization': 'Basic ' + hash
      }
    }, function( err, result, token ) {
      // Resolve promise
      resolve( {  
        headers: {
          'Content-Type': 'application/json'
        },
        body: token
      } );
    } );  
  } );
}
