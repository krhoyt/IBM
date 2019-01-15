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

  let team = await query( 'SELECT id, name FROM Team WHERE uuid = ?', params.id );

  result.id = params.id;
  result.name = team[0].name

  result.blog = await blog( query, team[0].id, result.start, result.end );
  result.medium = await medium( query, team[0].id, result.start, result.end );
  result.twitter = await twitter( query, team[0].id, result.start, result.end );
  result.youtube = await youtube( query, team[0].id, result.start, result.end );  
  result.github = await github( query, team[0].id, result.start, result.end );  
  result.answers = await so( query, team[0].id, result.start, result.end );  
  result.media = await media( query, team[0].id, result.start, result.end );  

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

async function blog( query, team, start, end ) {
  // Query
  const posts = await query( 
    'SELECT Post.* ' +
    'FROM Advocate, Blog, Post, Team ' +
    'WHERE Post.blog_id = Blog.id ' +
    'AND Blog.advocate_id = Advocate.id ' +
    'AND Advocate.team_id = Team.id ' +
    'AND Team.id = ? ' +
    'AND Post.published_at >= ? ' +
    'AND Post.published_at <= ? ' +
    'ORDER BY Post.published_at',
    [team, start, end] 
  );

  // Accumulations
  let category = '';  
  let keywords = '';
  
  // Calculate totals
  for( let p = 0; p < posts.length; p++ ) {
    delete posts[p].id;
    delete posts[p].blog_id;
    delete posts[p].created_at;
    delete posts[p].updated_at;

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

async function github( query, team, start, end ) {
  // Query
  const events = await query( 
    'SELECT Source.* ' +
    'FROM Advocate, GitHub, Source, Team ' +
    'WHERE Source.github_id = GitHub.id ' +
    'AND GitHub.advocate_id = Advocate.id ' +
    'AND Advocate.team_id = Team.id ' +
    'AND Team.id = ? ' +
    'AND Source.published_at >= ? ' +
    'AND Source.published_at <= ? ' +
    'ORDER BY Source.published_at',
    [team, start, end] 
  );

  // Accumulations
  let comment = 0;
  let pull = 0;
  let push = 0;
  let repos = '';

  // Calculate totals
  for( let e = 0; e < events.length; e++ ) {
    delete events[e].id;
    delete events[e].github_id;
    delete events[e].created_at;
    delete events[e].updated_at;

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
    
  const watchers = await query( 
    'SELECT ' +
    'Repository.id, ' +
    'Repository.pushed_at, ' +
    'Repository.name, ' + 
    'Repository.full_name, ' +
    'Repository.watchers ' +
    'FROM Repository ' +
    'WHERE Repository.repository_id IN ( ' +
    'SELECT DISTINCT Source.repository_id ' +
    'FROM Advocate, GitHub, Source, Team ' +
    'WHERE Source.github_id = GitHub.id ' +
    'AND GitHub.advocate_id = Advocate.id ' +
    'AND Advocate.team_id = Team.id ' +
    'AND Team.id = ? ' +
    'AND Source.published_at >= ? ' +
    'AND Source.published_at <= ? ' +
    ') ' +
    'ORDER BY Repository.watchers DESC',
    [team, start, end] 
  );  

  // Done
  return {
    comment: comment,
    events: events,
    pull: pull,
    push: push,
    repository: refine( repos, 10, false ),
    watchers: watchers
  };
}

async function media( query, team, start, end ) {
  // Query
  const images = await query( 
    'SELECT Media.* ' +
    'FROM Advocate, Media, Status, Twitter, Team ' +
    'WHERE Media.status_id = Status.status_id ' +
    'AND Status.twitter_id = Twitter.id ' +
    'AND Twitter.advocate_id = Advocate.id ' +
    'AND Advocate.team_id = Team.id ' +
    'AND Team.id = ? ' +
    'AND Media.published_at >= ? ' +
    'AND Media.published_at <= ? ' +
    'ORDER BY Media.published_at',
    [team, start, end] 
  );

  // Accumulations
  let keywords = '';
  
  // Calculate totals
  for( let i = 0; i < images.length; i++ ) {
    delete images[i].id;
    delete images[i].created_at;
    delete images[i].updated_at;

    keywords = keywords + ',' + images[i].keywords;
  }

  // Done
  return {
    images: images,
    keywords: refine( keywords )
  };
}

async function medium( query, team, start, end ) {
  // Query
  const articles = await query( 
    'SELECT Article.* ' +
    'FROM Advocate, Article, Medium, Team ' +
    'WHERE Article.medium_id = Medium.id ' +
    'AND Medium.advocate_id = Advocate.id ' +
    'AND Advocate.team_id = Team.id ' +
    'AND Team.id = ? ' +
    'AND Article.published_at >= ? ' +
    'AND Article.published_at <= ? ' +
    'ORDER BY Article.published_at',
    [team, start, end] 
  );

  // Accumulations
  let category = '';  
  let claps = 0;
  let keywords = '';
  
  // Calculate totals
  for( let a = 0; a < articles.length; a++ ) {
    delete articles[a].id;
    delete articles[a].medium_id;
    delete articles[a].created_at;
    delete articles[a].updated_at;

    category = category + ',' + articles[a].category;    
    keywords = keywords + ',' + articles[a].keywords;

    claps = claps + articles[a].claps;
  }

  // Done
  return {
    category: refine( category ),    
    keywords: refine( keywords ),
    articles: articles,
    claps: claps
  };
}

async function so( query, team, start, end ) {
  // Query
  const answers = await query( 
    'SELECT Answer.* ' +
    'FROM Advocate, Answer, StackOverflow, Team ' +
    'WHERE Answer.so_id = StackOverflow.id ' +
    'AND StackOverflow.advocate_id = Advocate.id ' +
    'AND Advocate.team_id = Team.id ' +
    'AND Team.id = ? ' +
    'AND Answer.answered_at >= ? ' +
    'AND Answer.answered_at <= ? ' +
    'ORDER BY Answer.answered_at',
    [team, start, end] 
  );

  // Accumulations
  let accepted = 0;
  let keywords = '';  
  let score = 0;
  let tags = ''; 

  // Calculate totals
  for( let a = 0; a < answers.length; a++ ) {
    delete answers[a].id;
    delete answers[a].so_id;
    delete answers[a].created_at;
    delete answers[a].updated_at;

    accepted = accepted + answers[a].accepted;
    keywords = keywords + ',' + answers[a].keywords;    
    score = score + answers[a].score;
    tags = tags + answers[a].tags;
  }
    
  let sorted_score = answers.sort( ( a, b ) => {
    if( a.score > b.score ) {
      return -1;
    }

    if( a.score < b.score ) {
      return 1;
    }

    return 0;
  } );

  let sorted_accepted = answers.sort( ( a, b ) => {
    if( a.accepted > b.accepted ) {
      return -1;
    }

    if( a.accepted < b.accepted ) {
      return 1;
    }

    return 0;
  } );  

  // Done
  return {
    total_accepted: accepted,    
    answers: answers,
    keywords: refine( keywords ),
    total_score: score,
    tags: refine( tags ),
    sorted_accepted: sorted_accepted,
    sorted_score: sorted_score
  };
}

async function twitter( query, team, start, end ) {
  // Query
  const status = await query( 
    'SELECT Status.* ' +
    'FROM Advocate, Status, Team, Twitter ' +
    'WHERE Status.twitter_id = Twitter.id ' +
    'AND Twitter.advocate_id = Advocate.id ' +
    'AND Advocate.team_id = Team.id ' +
    'AND Team.id = ? ' +
    'AND Status.published_at >= ? ' +
    'AND Status.published_at <= ? ' +
    'ORDER BY Status.published_at',
    [team, start, end] 
  );  

  // Accumulations
  let favorites = 0;
  let hashtags = '';  
  let mentions = '';  
  let retweets = 0;

  // Calculate totals
  for( let s = 0; s < status.length; s++ ) {
    delete status[s].id;
    delete status[s].twitter_id;
    delete status[s].created_at;
    delete status[s].updated_at;

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
    posts: status,    
    retweets: retweets,
  }
}

async function youtube( query, team, start, end ) {
  // Query
  const videos = await query( 
    'SELECT Video.* ' +
    'FROM Advocate, Team, Video, YouTube ' +
    'WHERE Video.youtube_id = YouTube.id ' +
    'AND YouTube.advocate_id = Advocate.id ' +
    'AND Advocate.team_id = Team.id ' +
    'AND Team.id = ? ' +
    'AND Video.published_at >= ? ' +
    'AND Video.published_at <= ? ' +
    'ORDER BY Video.published_at',
    [team, start, end] 
  );  

  // Accumulations
  let duration = 0;
  let seconds = 0;
  let stars = 0;
  let views = 0;

  // Calculate totals
  for( let v = 0; v < videos.length; v++ ) {
    delete videos[v].id;
    delete videos[v].youtube;
    delete videos[v].created_at;
    delete videos[v].updated_at;

    duration = duration + ( videos[v].views * videos[v].duration );           
    seconds = seconds + videos[v].duration;        
    stars = stars + videos[v].stars;
    views = views + videos[v].views;
  }

  let sorted_views = videos.sort( ( a, b ) => {
    if( a.views > b.views ) {
      return -1;
    }

    if( a.views < b.views ) {
      return 1;
    }

    return 0;
  } );

  let sorted_stars = videos.sort( ( a, b ) => {
    if( a.stars > b.stars ) {
      return -1;
    }

    if( a.stars < b.stars ) {
      return 1;
    }

    return 0;
  } );  

  // Done
  return {
    posts: videos,
    produced: seconds,    
    total_stars: stars,
    total_views: views,
    sorted_views: sorted_views,
    sorted_stars: sorted_stars
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
