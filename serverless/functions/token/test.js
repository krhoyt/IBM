const rp = require( 'request-promise' );

require( 'dotenv' ).config( {path: '../local.env'} );

main( {
  WATSON_API_KEY: process.env.WATSON_API_KEY
} );

async function main( params ) {
  const token = await rp( {
    method: 'POST',
    url: 'https://iam.bluemix.net/identity/token',
    form: {
      grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
      apikey: params.WATSON_API_KEY
    },
    json: true
  } );

  console.log( token );
}
