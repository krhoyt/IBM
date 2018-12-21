const fs = require( 'fs' );  
const jsonfile = require( 'jsonfile' );
const mysql = require( 'mysql' );
const util = require( 'util' );
const xl = require( 'excel4node' );

let params = jsonfile.readFileSync( __dirname + '/config.json' );
params.month = 11;

report();

async function report() {
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

  console.log( start );
  console.log( end );  

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

  let techs = await query( 'SELECT * FROM Technology' );

  let posts = await query( 
    'SELECT ' +
    'Advocate.email, ' +
    'Post.published_at, ' +
    'Post.title, ' +
    'Post.link, ' +
    'Post.category, ' +
    'Post.keywords ' +
    'FROM Advocate, Blog, Post ' +
    'WHERE Post.blog_id = Blog.id ' +
    'AND Blog.advocate_id = Advocate.id ' +
    'AND Post.published_at >= ? ' +
    'AND Post.published_at <= ? ' +
    'ORDER BY Post.published_at',
    [start, end]
  );

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

  let status = await query(
    'SELECT ' +
    'Advocate.email, ' +
    'Status.published_at, ' +
    'Status.text, ' +
    'Status.link, ' +
    'Status.favorite, ' +
    'Status.retweet, ' +
    'Status.hashtags, ' +
    'Status.mentions ' +
    'FROM Advocate, Status, Twitter ' +
    'WHERE Status.twitter_id = Twitter.id ' +
    'AND Twitter.advocate_id = Advocate.id ' +
    'AND Status.published_at >= ? ' +
    'AND Status.published_at <= ? ' +
    'ORDER BY Status.published_at',
    [start, end]
  );

  let videos = await query(
    'SELECT ' +
    'Advocate.email, ' +
    'Video.published_at, ' +
    'Video.title, ' +
    'Video.link, ' +
    'Video.views, ' +
    'Video.stars, ' +
    'Video.duration, ' +
    'Video.summary ' +
    'FROM Advocate, Video, YouTube ' +
    'WHERE Video.youtube_id = YouTube.id ' +
    'AND YouTube.advocate_id = Advocate.id ' +
    'AND Video.published_at >= ? ' +
    'AND Video.published_at <= ? ' +
    'ORDER BY Video.published_at',
    [start, end]
  );

  for( let t = 0; t < techs.length; t++ ) {
    console.log( techs[t].name );

    techs[t].keywords = techs[t].keywords.split( ',' ); 

    let book = new xl.Workbook();

    let sheet = book.addWorksheet( 'Blog' );
    blog( sheet, techs[t], posts );

    sheet = book.addWorksheet( 'Meetup' );
    meetup( sheet, techs[t], events );    

    sheet = book.addWorksheet( 'Twitter' );
    twitter( sheet, techs[t], status );        

    sheet = book.addWorksheet( 'YouTube' );
    youtube( sheet, techs[t], videos );            

    book.write( `${techs[t].file}.xlsx` );
  }

  connection.end();  
}

function blog( sheet, technology, posts ) {
  let row = 1;

  for( let p = 0; p < posts.length; p++ ) {
    if( posts[p].keywords != null ) {
      posts[p].keywords_split = posts[p].keywords.split( ',' );
    }

    if( posts[p].category != null ) {
      posts[p].category_split = posts[p].category.toLowerCase().split( ',' );
    }

    posts[p].title_split = posts[p].title.toLowerCase().split( ' ' );

    let found = false;

    for( let tech_words = 0; tech_words < technology.keywords.length; tech_words++ ) {
      if( posts[p].keywords != null ) {
        for( let post_words = 0; post_words < posts[p].keywords_split.length; post_words++ ) {
          if( technology.keywords[tech_words] == posts[p].keywords_split[post_words] ) {
            found = true;
            break;
          }
        }
      }

      if( posts[p].category != null ) {
        for( let post_words = 0; post_words < posts[p].category_split.length; post_words++ ) {
          if( technology.keywords[tech_words] == posts[p].category_split[post_words] ) {
            found = true;
            break;
          }
        }
      }

      for( let title_words = 0; title_words < posts[p].title_split.length; title_words++ ) {
        if( technology.keywords[tech_words] == posts[p].title_split[title_words].trim() ) {
          found = true;
          break;
        }
      }
    }

    if( found ) {
      sheet.cell( row, 1 ).string( posts[p].email );
      sheet.cell( row, 2 ).date( posts[p].published_at );
      sheet.cell( row, 3 ).string( posts[p].title );
      sheet.cell( row, 4 ).link( posts[p].link );

      if( posts[p].keywords != null ) {
        sheet.cell( row, 5 ).string( posts[p].keywords );
      }

      if( posts[p].category != null ) {
        sheet.cell( row, 6 ).string( posts[p].category );
      }

      row = row + 1;
    }    
  }
}

function meetup( sheet, technology, events ) {
  let row = 1;

  for( let e = 0; e < events.length; e++ ) {
    events[e].name_split = events[e].name.toLowerCase().split( ' ' );
    events[e].description_split = events[e].description.toLowerCase().split( ' ' );    

    let found = false;

    for( let tech_words = 0; tech_words < technology.keywords.length; tech_words++ ) {
      if( events[e].name != null ) {
        for( let event_words = 0; event_words < events[e].name_split.length; event_words++ ) {
          if( technology.keywords[tech_words] == events[e].name_split[event_words] ) {
            found = true;
            break;
          }
        }
      }

      if( events[e].description != null ) {
        for( let event_words = 0; event_words < events[e].description_split.length; event_words++ ) {
          if( technology.keywords[tech_words] == events[e].description_split[event_words] ) {
            found = true;
            break;
          }
        }
      }
    }

    if( found ) {
      sheet.cell( row, 1 ).string( events[e].city );
      sheet.cell( row, 2 ).date( events[e].starts_at );
      sheet.cell( row, 3 ).string( events[e].name );
      sheet.cell( row, 4 ).link( events[e].link );
      sheet.cell( row, 5 ).number( events[e].maximum );      
      sheet.cell( row, 6 ).number( events[e].rsvp );      
      sheet.cell( row, 7 ).number( events[e].waitlist );                  

      row = row + 1;
    }    
  }
}

function twitter( sheet, technology, status ) {
  let row = 1;

  for( let s = 0; s < status.length; s++ ) {
    status[s].text_split = status[s].text.toLowerCase().split( ' ' );

    if( status[s].hashtags != null ) {
      status[s].hashtags_split = status[s].hashtags.toLowerCase().split( ',' );
    }

    let found = false;

    for( let tech_words = 0; tech_words < technology.keywords.length; tech_words++ ) {
      if( status[s].text != null ) {
        for( let status_words = 0; status_words < status[s].text_split.length; status_words++ ) {
          if( technology.keywords[tech_words] == status[s].text_split[status_words] ) {
            found = true;
            break;
          }
        }
      }

      if( status[s].hashtags != null ) {
        for( let status_words = 0; status_words < status[s].hashtags_split.length; status_words++ ) {
          if( technology.keywords[tech_words] == status[s].hashtags_split[status_words] ) {
            found = true;
            break;
          }
        }
      }
    }

    if( found ) {
      sheet.cell( row, 1 ).string( status[s].email );
      sheet.cell( row, 2 ).date( status[s].published_at );
      sheet.cell( row, 3 ).string( status[s].text );
      sheet.cell( row, 4 ).link( status[s].link );
      sheet.cell( row, 5 ).number( status[s].favorite );      
      sheet.cell( row, 6 ).number( status[s].retweet );      

      if( status[s].hashtags != null ) {
        sheet.cell( row, 7 ).string( status[s].hashtags );
      }

      if( status[s].mentions != null ) {
        sheet.cell( row, 8 ).string( status[s].mentions );
      }      

      row = row + 1;
    }    
  }
}

function youtube( sheet, technology, videos ) {
  let row = 1;

  for( let v = 0; v < videos.length; v++ ) {
    videos[v].title_split = videos[v].title.toLowerCase().split( ' ' );

    if( videos[v].summary != null ) {
      videos[v].summary_split = videos[v].summary.toLowerCase().split( ' ' );
    }

    let found = false;

    for( let tech_words = 0; tech_words < technology.keywords.length; tech_words++ ) {
      if( videos[v].title != null ) {
        for( let video_words = 0; video_words < videos[v].title_split.length; video_words++ ) {
          if( technology.keywords[tech_words] == videos[v].title_split[video_words] ) {
            found = true;
            break;
          }
        }
      }

      if( videos[v].summary != null ) {
        for( let video_words = 0; video_words < videos[v].summary_split.length; video_words++ ) {
          if( technology.keywords[tech_words] == videos[v].summary_split[video_words] ) {
            found = true;
            break;
          }
        }
      }
    }

    if( found ) {
      sheet.cell( row, 1 ).string( videos[v].email );
      sheet.cell( row, 2 ).date( videos[v].published_at );
      sheet.cell( row, 3 ).string( videos[v].title );
      sheet.cell( row, 4 ).link( videos[v].link );
      sheet.cell( row, 5 ).number( videos[v].views );      
      sheet.cell( row, 6 ).number( videos[v].stars );      
      sheet.cell( row, 7 ).number( videos[v].duration );            

      if( videos[v].summary != null ) {
        sheet.cell( row, 8 ).string( videos[v].summary );
      }

      row = row + 1;
    }    
  }
}
