async function get( params ) {
  const cos = require( './cos.js' );

  const token = await cos.getToken( 
    params.COS_AUTH_ENDPOINT, 
    params.COS_API_KEY 
  );

  const object = await cos.getObject( 
    token, 
    params.COS_ENDPOINT, 
    params.COS_SERVICE_INSTANCE, 
    params.bucket, 
    params.name 
  );

  return {
    headers: { 
      'Content-Disposition': `attachment; filename="${params.name}"`,
      'Content-Type': object.content
    },
    statusCode: 200,
    body: object.file
  };    
}

exports.main = get;
