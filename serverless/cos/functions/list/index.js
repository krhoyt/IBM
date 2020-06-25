async function main( params ) {
  const rp = require( 'request-promise-native' );  

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

  let continuation = null;
  let listing = [];

  do {
    let url = `https://${params.COS_ENDPOINT}/${params.bucket}?list-type=2`;

    if( continuation !== null ) {
      url = url + '&continuation-token=' + continuation;
    }

    const data = await rp( {
      url: url,
      method: 'GET',
      headers: {
        Authorization: `${authorization.token_type} ${authorization.access_token}`
      },
    } )

    const list = await parse( data );

    continuation = list.continuation;
    listing = listing.concat( list.objects );
  } while( continuation !== null );

  return {
    headers: {
      'Content-Type': 'application/json'          
    },
    body: listing
  };    
}

exports.main = main;

function parse( data ) {
  const parser = require( 'xml2js' ).parseString;          

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
      
      let continuation = null;

      if( results.ListBucketResult.IsTruncated[0] === 'true' ) {
        continuation = results.ListBucketResult.NextContinuationToken[0];
      }

      resolve( {
        continuation: continuation,
        objects: objects
      } );
    } );
  } );  
}
