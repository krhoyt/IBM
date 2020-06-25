const fs = require( 'fs' );
const multipart = require( 'parted' ).multipart;
const rp = require( 'request-promise-native' );  
const sts = require( 'string-to-stream' );
const parser = require( 'xml2js' ).parseString;          

async function deleteBucket( token, endpoint, instance, bucket ) {
  return rp( {
    url: `https://${endpoint}/${bucket}`,
    method: 'DELETE',
    headers: {
      'ibm-service-instance-id': instance
    },
    auth: {
      bearer: token
    }
  } )
  .then( ( data ) => {
    return {
      name: bucket
    };
  } )
  .catch( ( e ) => {
    console.log( 'Error deleting bucket.' );
  } );
}

async function deleteObject( token, endpoint, instance, bucket, object ) {
  return rp( {
    url: `https://${endpoint}/${bucket}/${object}`,
    method: 'DELETE',
    headers: {
      'ibm-service-instance-id': instance
    },
    auth: {
      bearer: token
    }
  } )
  .then( ( data ) => {
    return {
      bucket: bucket,
      name: object
    };
  } )
  .catch( ( e ) => {
    console.log( 'Error deleting object.' );
  } );
}

async function getBucketList( token, endpoint, instance ) {
  return rp( {
    url: `https://${endpoint}?extended`,
    headers: {
      'ibm-service-instance-id': instance
    },
    auth: {
      bearer: token
    }
  } )
  .then( ( data ) => {
    return new Promise( ( resolve, reject ) => {
      parser( data, ( error, results ) => {
        let buckets = [];
  
        for( let b = 0; b < results.ListAllMyBucketsResult.Buckets[0].Bucket.length; b++ ) {
          buckets.push( {
            name: results.ListAllMyBucketsResult.Buckets[0].Bucket[b].Name[0],
            location: results.ListAllMyBucketsResult.Buckets[0].Bucket[b].LocationConstraint[0],
            created_at: new Date( results.ListAllMyBucketsResult.Buckets[0].Bucket[b].CreationDate[0] ),
            type: 'bucket'
          } );
        }
  
        resolve( buckets );
      } );      
    } );
  } )
  .catch( ( e ) => {
    console.log( 'Error getting bucket list.' );
  } );  
}

async function getFile( body, content ) {
  return new Promise( ( resolve, reject ) => {
    // Decode the stream into a string
    let decoded = new Buffer( body, 'base64' );
    let stream = sts( decoded );

    // Disk management
    const options = {
      limit: 30 * 1024,
      diskLimit: 30 * 1024 * 1024
    };

    // Parse the parts of the string
    // Will have demarkation per HTTP specification
    let parser = new multipart( content, options );
    let parts = {};

    // Whoops!
    parser.on( 'error', ( e ) => {
      console.log( 'Error parsing HTTP request.' );
    } );

    // Put parts into key/value object
    parser.on( 'part', ( field, part ) => {
      parts[field] = part;
    } );

    // Parsing is complete
    parser.on( 'end', () => {      
      // File part into Buffer
      let object = fs.readFileSync( parts.file );
      
      resolve( {
        bucket: parts.bucket,
        name: parts.name,
        file: object
      } );
    } );

    // Send HTTP request to parser
    stream.pipe( parser );              
  } )
  .catch( ( e ) => {
    console.log( 'Error parsing file.' );
  } );  
}

async function getObject( token, endpoint, instance, bucket, object ) {
  return rp( {
    url: `https://${endpoint}/${bucket}/${object}`,
    method: 'GET',
    headers: {
      'ibm-service-instance-id': instance
    },
    auth: {
      bearer: token
    },
    resolveWithFullResponse: true,  // Headers and body
    encoding: null                  // Returns Buffer instance
  } )
  .then( ( response ) => {
    return {
      content: response.headers['content-type'],
      file: response.body.toString( 'base64' ) // Encode for response
    }
  } )
  .catch( ( e ) => {
    console.log( 'Error getting object.' );
  } );
}

async function getObjectList( token, endpoint, instance, bucket ) {
  return rp( {
    url: `https://${endpoint}/${bucket}?list-type=2`,
    method: 'GET',
    headers: {
      'ibm-service-instance-id': instance
    },
    auth: {
      bearer: token
    }
  } )
  .then( ( data ) => {
    return new Promise( ( resolve, reject ) => {
      parser( data, ( error, results ) => {
        let objects = [];
  
        if( results.ListBucketResult.Contents ) {
          for( let i = 0; i < results.ListBucketResult.Contents.length; i++ ) {
            objects.push( {
              name: results.ListBucketResult.Contents[i].Key[0],
              modified: new Date( results.ListBucketResult.Contents[i].LastModified[0] ),
              size: parseInt( results.ListBucketResult.Contents[i].Size[0] ),
              type: 'object'
            } );
          }
        }
        
        resolve( objects );
      } );
    } );
  } )
  .catch( ( e ) => {
    console.log( 'Error getting object list.' );
  } );
}

async function getToken( endpoint, key ) {
  return rp( {
    url: endpoint,
    method: 'POST',
    form: {
      apikey: key,
      response_type: 'cloud_iam',
      grant_type: 'urn:ibm:params:oauth:grant-type:apikey'
    },
    json: true
  } )  
  .then( ( data ) => {
    return data.access_token;
  } )
  .catch( ( e ) => {
    console.log( 'Error getting token.' );
  } );
}

async function putBucket( token, endpoint, instance, bucket ) {
  return rp( {
    url: `https://${endpoint}/${bucket}`,
    method: 'PUT',
    headers: {
      'ibm-service-instance-id': instance
    },
    auth: {
      bearer: token
    }
  } )
  .then( ( data ) => {
    return {
      name: bucket
    };
  } )
  .catch( ( e ) => {
    console.log( 'Error creating bucket.' );
  } );  
}

async function putObject( token, endpoint, instance, file, bucket, object ) {
  return rp( {
    url: `https://${endpoint}/${bucket}/${object}`,
    method: 'PUT',
    headers: {
      'ibm-service-instance-id': instance
    },
    auth: {
      bearer: token
    },
    body: file,
    resolveWithFullResponse: true      
  } )
  .then( ( response ) => {
    // ETag comes with nested quotes
    // Remove quotes
    let etag = response.headers['etag'].replace( /"/g,"" );

    return {
      etag: etag,
      name: object,
      bucket: bucket
    };
  } )
  .catch( ( e ) => {
    console.log( 'Error uploading object.' );
  } )
}

module.exports.deleteBucket = deleteBucket;
module.exports.deleteObject = deleteObject;
module.exports.getBucketList = getBucketList;
module.exports.getFile = getFile;
module.exports.getObject = getObject;
module.exports.getObjectList = getObjectList;
module.exports.getToken = getToken;
module.exports.putBucket = putBucket;
module.exports.putObject = putObject;
