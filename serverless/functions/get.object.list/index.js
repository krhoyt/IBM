async function get( params ) {
  const cos = require( './cos.js' );

  const token = await cos.getToken( 
    params.COS_AUTH_ENDPOINT, 
    params.COS_API_KEY 
  );

  const objects = await cos.getObjectList( 
    token, 
    params.COS_ENDPOINT, 
    params.COS_SERVICE_INSTANCE, 
    params.bucket 
  );

  return {
    headers: {
      'Content-Type': 'application/json'          
    },
    body: objects
  };    
}

exports.main = get;
