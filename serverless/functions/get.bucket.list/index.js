async function get( params ) {
  const cos = require( './cos.js' );

  const token = await cos.getToken( 
    params.COS_AUTH_ENDPOINT, 
    params.COS_API_KEY 
  );

  const buckets = await cos.getBucketList( 
    token, 
    params.COS_ENDPOINT, 
    params.COS_SERVICE_INSTANCE 
  );

  return {
    headers: {
      'Content-Type': 'application/json'          
    },
    body: buckets
  };    
}

exports.main = get;
