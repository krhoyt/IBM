async function main( params ) {
  const rp = require( 'request-promise' );

  if( params.status === 'added' ) {
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
        
    const contents = await rp( {
      url: `https://${params.endpoint}/${params.bucket}/${params.key}`,
      method: 'GET',
      headers: {
        Authorization: `${authorization.token_type} ${authorization.access_token}`,
        'ibm-service-instance-id': params.COS_SERVICE_INSTANCE
      },
      encoding: null
    } );
    
    const classification = await rp( {
      url: 'https://gateway.watsonplatform.net/visual-recognition/api/v3/classify',
      method: 'POST',
      auth: {
        user: params.WATSON_USERNAME,
        pass: params.WATSON_PASSWORD
      },
      formData: {
        images_file: {
          value: contents,
          options: {
            filename: params.key
          }
        }
      },
      qs: {
        version: '2018-03-19'
      },
      json: true
    } );      

    const doc = await rp( {
      url: `https://${params.CLOUDANT_ACCOUNT}.cloudant.com/${params.CLOUDANT_DATABASE}`,
      method: 'POST',
      auth: {
        user: params.CLOUDANT_USERNAME,
        pass: params.CLOUDANT_PASSWORD
      },
      json: true,
      body: classification
    } );      

    const message = await rp( {
      url: `https://ps.pndsn.com/publish/${params.PUBNUB_PUBLISH}/${params.PUBNUB_SUBSCRIBE}/0/${params.PUBNUB_CHANNEL}/0`,
      method: 'POST',
      json: true,
      body: {
        classification: classification,
        document: doc,
        trigger: {
          status: params.added,
          bucket: params.bucket,
          endpoint: params.endpoint,
          key: params.key
        }
      }
    } );

    return message;
  }

  return {payload: 'Tell'};
}
