async function remove( params ) {
  const cos = require( './cos.js' );

  const token = await cos.getToken( 
    params.COS_AUTH_ENDPOINT, 
    params.COS_API_KEY 
  );

  const object = await cos.deleteObject( 
    token, 
    params.COS_ENDPOINT, 
    params.COS_SERVICE_INSTANCE, 
    params.bucket,
    params.name 
  );

  return {
    headers: {
      'Content-Type': 'application/json'          
    },
    body: object
  };   
}

exports.main = remove;
