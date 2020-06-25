async function remove( params ) {
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

  for( let f = 0; f < objects.length; f++ ) {
    await cos.deleteObject( 
      token, 
      params.COS_ENDPOINT, 
      params.COS_SERVICE_INSTANCE, 
      params.bucket, 
      objects[f].name 
    );
  }
    
  const bucket = await cos.deleteBucket( 
    token, 
    params.COS_ENDPOINT, 
    params.COS_SERVICE_INSTANCE, 
    params.bucket 
  ); 

  return {
    headers: {
      'Content-Type': 'application/json'          
    },
    body: bucket
  };   
}

exports.main = remove;
