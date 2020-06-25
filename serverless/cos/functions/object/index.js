async function main( params ) {
  const rp = require( 'request-promise' );

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

  return {
    headers: { 
      'Content-Disposition': `attachment; filename="${params.key}"`,
      'Content-Type': object.headers['content-type']
    },
    statusCode: 200,
    body: object.body.toString( 'base64' ) // Encode for response 
  };    
}
