async function main( params ) {
  const rp = require( 'request-promise' );

  const token = await rp( {
    method: 'POST',
    url: 'https://iam.bluemix.net/identity/token',
    form: {
      grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
      apikey: params.WATSON_TTS_KEY
    },
    json: true
  } );

  return {
    headers: { 
      'Content-Type': 'text/plain'
    },
    statusCode: 200,
    body: token.access_token
  };    
}
