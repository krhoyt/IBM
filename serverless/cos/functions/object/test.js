const rp = require( 'request-promise' );

require( 'dotenv' ).config( {path: '../local.env'} );

main( {
  COS_API_KEY: process.env.COS_API_KEY,
  COS_ENDPOINT: process.env.COS_ENDPOINT,
  COS_SERVICE_INSTANCE: process.env.COS_SERVICE_INSTANCE,
  bucket: process.env.COS_BUCKET,
  key: process.env.COS_KEY
} );

async function main( params ) {
  const authorization = await rp( {
    url: 'https://iam.ng.bluemix.net/oidc/token',
    method: 'POST',
    form: {
      apikey: params.COS_API_KEY,
      response_type: 'cloud_iam',
      grant_type: 'urn:ibm:params:oauth:grant-type:apikey'
    },
    json: true
  } );
  
  const object = await rp( {
    url: `https://${params.COS_ENDPOINT}/${params.bucket}/${params.key}`,
    method: 'GET',
    headers: {
      Authorization: `${authorization.token_type} ${authorization.access_token}`,
      'ibm-service-instance-id': params.COS_SERVICE_INSTANCE
    },
    resolveWithFullResponse: true,  // Headers and body
    encoding: null                  // Returns Buffer instance
  } );

  console.log( {
    content: object.headers['content-type'],
    file: object.body.toString( 'base64' ) // Encode for response     
  } );
}
