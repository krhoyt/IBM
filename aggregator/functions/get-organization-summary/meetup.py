const jsonfile = require( 'jsonfile' );
const mysql = require( 'mysql' );
const util = require( 'util' );

let params = jsonfile.readFileSync( __dirname + '/config.json' );
params.id = '5c346753-367b-43eb-af77-1623093eae52';

report();

async function report() {
  let start = new Date( 2018, 0, 1 );
  let end = new Date( 2018, 12, 31 );

  // Connect to MySQL
  // Compose
  const connection = mysql.createConnection( {
    host: params.MYSQL_HOST,
    port: params.MYSQL_PORT,
    user: params.MYSQL_USER,
    password: params.MYSQL_PASSWORD,
    ssl: {
      ca: fs.readFileSync( __dirname + '/' + params.MYSQL_CERTIFICATE )
    },
    database: params.MYSQL_DATABASE
  } );

  connection.connect();

  const query = util.promisify( connection.query ).bind( connection );

  let organization = await query( 'SELECT * FROM Organization WHERE uuid = ?', params.id );
  console.log( organization[0].id + ' (' + params.id + ')' );

  let techs = await query( 'SELECT * FROM Technology' );

  let events = await query(
    'SELECT ' +
    'Event.starts_at, ' +
    'Meetup.city, ' +
    'Event.name, ' +
    'Event.description, ' +
    'Event.link, ' +
    'Event.maximum, ' +
    'Event.rsvp, ' +
    'Event.waitlist ' +
    'FROM Event, Meetup ' +
    'WHERE Event.meetup_id = Meetup.id ' +
    'AND Event.starts_at >= ? ' +
    'AND Event.starts_at <= ? ' +
    'ORDER BY Event.starts_at',
    [start, end]
  );

  connection.end();  

  for( let t = 0; t < techs.length; t++ ) {
    console.log( techs[t].name );

    sheet = workbook.getWorksheet( 'Meetups' );
    results = fill( 
      techs[t], 
      events, 
      ['name', 'description'],
      [' ', ' '],
      ['city', 'starts_at', 'name', 'link', 'maximum', 'rsvp', 'waitlist']
    );        

    console.log( results );        
  }

  console.log( 'Done' );
}

function fill( technology, data, split, delimiters, fields ) {
  let row = 2;
  let cols = 'ABCDEFGH';
  let sheet = [];

  for( let d = 0; d < data.length; d++ ) {  
    for( let s = 0; s < split.length; s++ ) {
      if( data[d][split[s]] != null ) {
        data[d][split[s] + '_split'] = data[d][split[s]].toLowerCase().split( delimiters[s] );
      }
    }

    let found = false;

    for( let tech_words = 0; tech_words < technology.keywords.length; tech_words++ ) {
      for( let s = 0; s < split.length; s++ ) {
        if( data[d][split[s]] != null ) {
          for( let data_words = 0; data_words < data[d][split[s] + '_split'].length; data_words++ ) {
            if( technology.keywords[tech_words] == data[d][split[s] + '_split'][data_words].trim() ) {
              found = true;
              break;
            }
          }        
        }
      } 
    }
  
    if( found ) {
      for( let f = 0; f < fields.length; f++ ) {
        let value = '';
  
        if( data[d][fields[f]] != null ) {
          value = data[d][fields[f]];
        }   
  
        sheet.getCell( cols.charAt( f ) + row ).value = value;
      }
  
      row = row + 1;
    }        
  }   
}

async function upload( cos, bucket, id ) {
  let upload_id = null;

  if( !fs.existsSync( `${id}.zip` ) ) {
    console.log( new Error( 'File does not exist.' ) );
    return;
  }

  return cos.createMultipartUpload( {
    Bucket: bucket,
    Key: id + '.zip'
  } )
  .promise()
  .then( ( data ) => {
    upload_id = data.UploadId;

    fs.readFile( id + '.zip', ( e, file_data ) => {
      let part_size = 1024 * 1024 * 5;
      let part_count = Math.ceil( file_data.length / part_size );

      async.timesSeries( part_count, ( part_num, next ) => {
        let start = part_num * part_size;
        let end = Math.min( start + part_size, file_data.length );

        part_num = part_num + 1;

        cos.uploadPart( {
          Body: file_data.slice( start, end ),
          Bucket: bucket,
          Key: id + '.zip',
          PartNumber: part_num,
          UploadId: upload_id
        } )
        .promise()
        .then( ( data ) => {
          next( e, {ETag: data.ETag, PartNumber: part_num} );
        } )
        .catch( ( e ) => {
          cancel( cos, bucket, id + '.zip', upload_id );
          console.log( `ERROR: ${e.code} - ${e.message}\n` );
        } );
      }, ( e, data_packs ) => {
        cos.completeMultipartUpload( {
          Bucket: bucket,
          Key: id + '.zip',
          MultipartUpload: {
            Parts: data_packs
          },
          UploadId: upload_id
        } )
        .promise()
        .then( console.log( 'Upload complete.' ) )
        .catch( ( e ) => {
          cancel( cos, bucket, id + '.zip', upload_id );
          console.error( `ERROR: ${e.code} - ${e.message}\n` );
        } );
      } );
    } );
  } )
  .catch( ( e ) => {
    console.error( `ERROR: ${e.code} - ${e.message}\n` );
  } );
}  
