async function put( params ) {
  const cos = require( './cos.js' );

  const upload = await cos.getFile( 
    params.__ow_body, 
    params.__ow_headers[ 'content-type' ]
  );

  const token = await cos.getToken( 
    params.COS_AUTH_ENDPOINT, 
    params.COS_API_KEY 
  );

  const object = await cos.putObject( 
    token, 
    params.COS_ENDPOINT, 
    params.COS_SERVICE_INSTANCE, 
    upload.file, 
    upload.bucket, 
    upload.name
  );

  return {
    headers: {
      'Content-Type': 'application/json'          
    },
    body: object
  };    
}

exports.main = put;
