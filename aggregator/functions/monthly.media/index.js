async function report( params ) {
  const fs = require( 'fs' );  
  const mysql = require( 'mysql' );
  const util = require( 'util' );  
  
  // Query date
  let year = 0;
  let month = 0;
  let last = 0;

  // Right now
  const now = new Date();

  // Year
  if( params.year ) {
    year = parseInt( params.year );
  } else {
    year = now.getFullYear();
  }

  // Month
  if( params.month ) {
    // Let user use one-based month
    // Map to zero-based JavaScript
    month = parseInt( params.month - 1 );
  } else {
    month = now.getMonth();
  }

  // Last day of month
  // https://stackoverflow.com/questions/222309
  last = new Date( year, month + 1, 0 ).getDate();

  // Formalize
  // For use in query
  const start = new Date( year, month, 1 );
  const end = new Date( year, month, last );

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

  // Query
  const photos = await query( 'SELECT * FROM Media WHERE published_at >= ? AND published_at <= ?', [start, end] );

  // Accumulations
  let keywords = '';
  let links = [];
  
  // Calculate totals
  for( let p = 0; p < photos.length; p++ ) {
    keywords = keywords + ',' + photos[p].keywords;
    links.push( photos[p].url );
  }

  // Build response
  return {
    headers: { 
      'Content-Type': 'application/json' 
    },
    statusCode: 200,
    body: {
      month: month + 1,
      year: year,
      keywords: refine( keywords ),
      photos: links
    }
  };
}

const refine = ( words, maximum = 10, clean = true ) => {
  // Nothing to refine
  if( words.length == 0 ) {
    return [];
  }

  // Ad hoc cleaning
  if( clean ) {
    words = words.replace( /_/g, ' ' );
    words = words.replace( /-/g, ' ' );
  }

  // First character is often a comma
  // Not always
  // Watch for that use case
  if( words.charAt( 0 ) == ',' ) {
    words = words.slice( 1 );
  }

  // Lowercase the entire string
  // Split words into an array
  // TODO: Allow for case sensitivity
  words = words.toLowerCase();
  words = words.split( ',' );

  // Results array
  let top = [];

  // Look at all the words
  for( let w = 0; w < words.length; w++ ) {
    // Database NULL becomes null as string
    // i.e. when bloggers do not assign categories
    // Disregard that situation
    if( words[w] == 'null' ) {
      continue;
    }

    // Was word found in results array
    // Which element
    let found = false;
    let index = 0;

    // Look through existing words
    for( index = 0; index < top.length; index++ ) {
      // Hey, this word exists
      // Moving on to the next word
      if( words[w] == top[index].word ) {
        found = true;
        break;
      }
    }

    // New word found
    // Add it, set it to one
    // Existing word found
    // Increment count by one
    if( found ) {
      top[index].count = top[index].count + 1;
    } else {
      top.push( {
        count: 1,
        word: words[w]
      } );
    }
  }

  // Sort array by number of occurances
  // Distinct words at this point
  top = top.sort( ( a, b ) => {
    if( a.count < b.count ) {
      return 1;
    }

    if( a.count > b.count ) {
      return -1;
    }

    return 0;
  } );

  // Return some sampling off the top
  return top.slice( 0, maximum );
}

exports.main = report;
