async function put( params ) {
  const cos = require( './cos.js' );

  const token = await cos.getToken( 
    params.COS_AUTH_ENDPOINT, 
    params.COS_API_KEY 
  );

  const bucket = await cos.putBucket( 
    token, 
    params.COS_ENDPOINT, 
    params.COS_SERVICE_INSTANCE, 
    params.name 
  );

  return {
    headers: {
      'Content-Type': 'application/json'          
    },
    body: bucket
  };    
}

exports.main = put;
