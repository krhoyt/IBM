var request = require( 'request' );

function main( params ) {
  return new Promise( function( resolve, reject ) {
    request( {
      method: 'POST',
      url: params.BLOCKCHAIN_PEER,
      headers: {
        'Accept': 'application/json'
      },
      json: params.message
    }, function( err, result, body ) {
      resolve( {
        headers: {
          'Content-Type': 'application/json'
        },
        body: body
      } );
    } )
  } );
}
