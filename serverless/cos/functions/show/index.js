async function show( params ) {
  const rp = require( 'request-promise-native' );  

  const upload = await getFile( 
    params.__ow_body, 
    params.__ow_headers[ 'content-type' ]
  );

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

  const object = await rp( {
    url: `https://${params.COS_ENDPOINT}/${upload.bucket}/${upload.name}`,
    method: 'PUT',
    headers: {
      Authorization: `${authorization.token_type} ${authorization.access_token}`,      
      'ibm-service-instance-id': params.COS_SERVICE_INSTANCE
    },
    body: upload.file,
    resolveWithFullResponse: true      
  } );

  // ETag comes with nested quotes
  // Remove quotes
  const etag = object.headers['etag'].replace( /"/g,"" );

  return {
    headers: {
      'Content-Type': 'application/json'          
    },
    body: {
      etag: etag,
      name: upload.name,
      bucket: upload.bucket
    }
  };    
}

exports.main = show;

function getFile( body, content ) {
  const fs = require( 'fs' );
  const multipart = require( 'parted' ).multipart;
  const sts = require( 'string-to-stream' );  

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

