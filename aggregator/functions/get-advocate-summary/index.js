async function report( params ) {
  const fs = require( 'fs' );  
  const mysql = require( 'mysql' );
  const util = require( 'util' );  
  
  let result = {};

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
  if( params.month || params.year ) {
    result.start = new Date( year, month, 1 );
    result.end = new Date( year, month, last );
  } else {
    result.start = new Date( year, month, now.getDate() );
    result.start.setDate( result.start.getDate() - 30 );
    result.end = new Date( year, month, now.getDate() );
  }
  
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

  console.log( result.start );
  console.log( result.end );  

  let advocate = await query( 'SELECT id FROM Advocate WHERE uuid = ?', params.id );

  if( advocate.length > 0 ) {
    advocate = advocate[0].id;

    result.id = params.id;
  
    result.blog = await blog( query, advocate, result.start, result.end );
    result.github = await github( query, advocate, result.start, result.end );
    result.so = await so( query, advocate, result.start, result.end );
    result.twitter = await twitter( query, advocate, result.start, result.end );
    result.youtube = await youtube( query, advocate, result.start, result.end );
  }

  connection.end();  

  // Build response
  return {
    headers: { 
      'Content-Type': 'application/json' 
    },
    statusCode: 200,
    body: result
  };
}

async function blog( query, advocate, start, end ) {
  // Query
  const posts = await query(
    'SELECT Post.guid, Post.title, Post.category, Post.keywords ' +
    'FROM Advocate, Blog, Post ' +
    'WHERE Advocate.id = Blog.advocate_id ' +
    'AND Blog.id = Post.blog_id ' +
    'AND Advocate.id = ? ' +
    'AND Post.published_at >= ? ' +
    'AND Post.published_at <= ? ' +
    'ORDER BY Post.published_at DESC', 
    [advocate, start, end] 
  );

  console.log( posts.length );

  // Accumulations
  let category = '';  
  let keywords = '';
  
  // Calculate totals
  for( let p = 0; p < posts.length; p++ ) {
    category = category + ',' + posts[p].category;    
    keywords = keywords + ',' + posts[p].keywords;
  }

  // Done
  return {
    category: refine( category ),    
    keywords: refine( keywords ),
    posts: posts
  };
}

async function github( query, advocate, start, end ) {
  // Query
  const events = await query(
    'SELECT Source.source_id, Source.source_type, Source.repository_name ' +
    'FROM Advocate, GitHub, Source ' +
    'WHERE Advocate.id = GitHub.advocate_id ' +
    'AND GitHub.id = Source.github_id ' +
    'AND Advocate.id = ? ' +
    'AND Source.published_at >= ? ' +
    'AND Source.published_at <= ? ' +
    'ORDER BY Source.published_at DESC',
    [advocate, start, end] 
  );  

  // Accumulations
  let comment = 0;
  let pull = 0;
  let push = 0;
  let repos = '';

  // Calculate totals
  for( let e = 0; e < events.length; e++ ) {
    let start = events[e].repository_name.indexOf( '/' ) + 1;
    repos = repos + ',' + events[e].repository_name.slice( start );

    switch( events[e].source_type ) {
      case 'IssueCommentEvent':
        comment = comment + 1;
        break;

      case 'PullRequestEvent':
        pull = pull + 1;
        break;

      case 'PushEvent':
        push = push + 1;
        break;
    }
  }
    
  // Done
  return {
    comment: comment,
    events: events,
    pull: pull,
    push: push,
    repository: refine( repos, 10, false )
  };
}

async function so( query, advocate, start, end ) {
  // Query
  const answers = await query( 
    'SELECT Answer.answer_id, Answer.question_id, Answer.score, Answer.accepted, Answer.link, Answer.title, Answer.tags, Answer.keywords ' +
    'FROM Advocate, Answer, StackOverflow ' +
    'WHERE Advocate.id = StackOverflow.advocate_id ' +
    'AND StackOverflow.id = Answer.so_id ' +
    'AND Advocate.id = ? ' +
    'AND Answer.answered_at >= ? ' +
    'AND Answer.answered_at <= ? ' +
    'ORDER BY Answer.answered_at DESC',
    [advocate, start, end]
  );  

  // Accumulations
  let accepted = 0;
  let keywords = '';  
  let score = 0;
  let tags = ''; 

  // Calculate totals
  for( let a = 0; a < answers.length; a++ ) {
    accepted = accepted + answers[a].accepted;
    keywords = keywords + ',' + answers[a].keywords;    
    score = score + answers[a].score;
    tags = tags + answers[a].tags;
  }
    
  // Done
  return {
    accepted: accepted,    
    answers: answers,
    keywords: refine( keywords ),
    score: score,
    tags: refine( tags )
  };
}

async function twitter( query, advocate, start, end ) {
  // Query
  const status = await query( 
    'SELECT Status.status_id, Status.link, Status.text, Status.favorite, Status.retweet, Status.hashtags, Status.mentions ' +
    'FROM Advocate, Status, Twitter ' +
    'WHERE Advocate.id = Twitter.advocate_id ' +
    'AND Twitter.id = Status.twitter_id ' +
    'AND Advocate.id = ? ' +
    'AND Status.published_at >= ? ' +
    'AND Status.published_at <= ? ' +
    'ORDER BY Status.published_at DESC',
    [advocate, start, end]
  );  

  // Accumulations
  let favorites = 0;
  let hashtags = '';  
  let mentions = '';  
  let retweets = 0;

  // Calculate totals
  for( let s = 0; s < status.length; s++ ) {
    favorites = favorites + status[s].favorite;
    retweets = retweets + status[s].retweet;

    hashtags = hashtags + ',' + status[s].hashtags;
    mentions = mentions + ',' + status[s].mentions;
  }

  // Done
  return {
    favorites: favorites,
    hashtags: refine( hashtags ),
    mentions: refine( mentions, 10, false ),
    status: status,    
    retweets: retweets,
  }
}

async function youtube( query, advocate, start, end ) {
  // Query
  const videos = await query(
    'SELECT Video.video_id, Video.link, Video.title, Video.views, Video.stars, Video.duration ' +
    'FROM Advocate, YouTube, Video ' +
    'WHERE Advocate.id = YouTube.advocate_id ' +
    'AND YouTube.id = Video.youtube_id ' +
    'AND Advocate.id = ? ' +
    'AND Video.published_at >= ? ' +
    'AND Video.published_at <= ? ' +
    'ORDER BY Video.published_at DESC',
    [advocate, start, end]
  );  

  // Accumulations
  let duration = 0;
  let seconds = 0;
  let stars = 0;
  let views = 0;

  // Calculate totals
  for( let v = 0; v < videos.length; v++ ) {
    duration = duration + ( videos[v].views * videos[v].duration );           
    seconds = seconds + videos[v].duration;        
    stars = stars + videos[v].stars;
    views = views + videos[v].views;
  }

  // Done
  return {
    videos: videos,
    produced: seconds,    
    stars: stars,
    views: views    
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

    if( words[w].length == 0 ) {
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
