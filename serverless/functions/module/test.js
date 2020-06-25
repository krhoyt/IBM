const cos = require( './cos.js' );
const fs = require( 'fs' );
const jsonfile = require( 'jsonfile' );

const params = jsonfile.readFileSync( 'config.json' );
params.bucket = 'krhoyt-was-here';
params.object = 'krhoyt.jpg';

test( params );

async function test( params ) {
  const token = await cos.getToken( 
    params.COS_AUTH_ENDPOINT, 
    params.COS_API_KEY 
  );
  console.log( token );

  const buckets = await cos.getBucketList( 
    token, 
    params.COS_ENDPOINT, 
    params.COS_SERVICE_INSTANCE 
  );
  console.log( buckets );

  const bucket = await cos.putBucket( 
    token, 
    params.COS_ENDPOINT, 
    params.COS_SERVICE_INSTANCE, 
    params.bucket 
  );
  console.log( bucket );

  const file = fs.readFileSync( params.object );  
  const object = await cos.putObject( 
    token, 
    params.COS_ENDPOINT, 
    params.COS_SERVICE_INSTANCE, 
    file, 
    params.bucket, 
    params.object
  );
  console.log( object );

  const objects = await cos.getObjectList( 
    token, 
    params.COS_ENDPOINT, 
    params.COS_SERVICE_INSTANCE, 
    params.bucket 
  );
  console.log( objects );

  const removed = await cos.deleteObject( 
    token, 
    params.COS_ENDPOINT, 
    params.COS_SERVICE_INSTANCE, 
    params.bucket, 
    params.object 
  );
  console.log( removed );

  const gone = await cos.deleteBucket( 
    token, 
    params.COS_ENDPOINT, 
    params.COS_SERVICE_INSTANCE, 
    params.bucket 
  );
  console.log( gone );
}
