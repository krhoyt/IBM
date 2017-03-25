var request = require( 'request' );

function main( params ) {
  return new Promise( function( resolve, reject ) {
    request( {
      method: 'POST',
      url: params.BLOCKCHAIN_PEER,
      headers: {
        'Accept': 'application/json'
      },
      json: {
        jsonrpc: "2.0",
        method: "query",
        params: {
          chaincodeID: {
            name: params.BLOCKCHAIN_NAME
          },
          type: 1,
          ctorMsg: {
            function: "read",
            args: ["greeting"]
          },
          secureContext: params.BLOCKCHAIN_USER
        },
        id: 1
      }
    }, function( err, result, body ) {
      var message = JSON.parse( body.result.message );

      resolve( {
        headers: {
          'Content-Type': 'application/json'
        },
        body: message
      } );
    } )
  } );
}
