
var request = require( 'request-promise' );

function main( params ) {
  // Build URL
  var url = 
    'https://gateway.watsonplatform.net' +
    '/conversation/api/v1/workspaces/' +
    params.WATSON_WORKSPACE +
    '/message?' +
    'version=2017-05-26';

  // Make API call
  // Return promise
  return request( {
    url: url,
    method: 'POST',
    auth: {
      user: params.WATSON_USERNAME,
      pass: params.WATSON_PASSWORD
    },
    json: {
      input: {
        text: params.message
      }
    }
  } ).then( function( result ) {
    // CORS
    // JSON
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',        
        'Content-Type': 'application/json'
      },
      statusCode: 200,
      body: new Buffer( JSON.stringify( result ) ).toString( 'base64' )
    };
  } );
}
