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
        method: "invoke",
        params: {
          chaincodeID: {
            name: params.BLOCKCHAIN_NAME
          },
          type: 1,
          ctorMsg: {
            function: "write",
            args: ["greeting", JSON.stringify( params.greeting )]
          },
          secureContext: params.BLOCKCHAIN_USER
        },
        id: 1
      }
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
