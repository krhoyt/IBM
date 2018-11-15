const mysql = require( 'mysql' );

function main( params ) {
  const connection = mysql.createConnection( {
    host: params.MYSQL_HOST,
    user: params.MYSQL_USER,
    password: params.MYSQL_PASSWORD,
    port: params.MYSQL_PORT,
    database: params.MYSQL_DATABASE
  } );  
  
  return new Promise( ( resolve, reject ) => {
    let hours = {};
    let days = {};
    let date = {};
    let tweets = [];
    let mentions = [];
    let media = [];

    connection.connect( function( err ) {
      if( err ) {
        throw err;
      } 

      let today = new Date();
      today.setDate( today.getDate() - 31 );
  
      let start = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    
      let query = 
      'SELECT S.first, S.nickname, S.last, S.photo, S.twitter, T.created_at, T.twitter_id, T.text, T.mentions ' +
      'FROM Staff AS S, Twitter AS T ' +
      'WHERE S.id = T.staff_id ' +
      'AND T.created_at >= \'' + start + '\' ' +
      'ORDER BY T.created_at DESC';  

      connection.query( query, ( err, results, fields ) => {
        if( err ) {
          throw error;
        } 

        for( let r = 0; r < results.length; r++ ) {
          if( results[r].mentions !== null ) {
            let names = results[r].mentions.split( ',' );
          
            for( let n = 0; n < names.length; n++ ) {
              let found = false;
      
              for( let m = 0; m < mentions.length; m++ ) {
                if( mentions[m].name.trim().toLowerCase() === names[n].trim().toLowerCase() ) {
                  found = true;
                  mentions[m].count = mentions[m].count + 1;
                  break;
                }
              }
      
              if( !found ) {
                mentions.push( {
                  name: names[n],
                  count: 1
                 } );
              }
            }
          }
    
          mentions.sort( ( a, b ) => {
            if( a.count < b.count ) {
              return 1;
            }
    
            if( b.count < a.count ) {
              return -1;
            }
    
            return 0;
          } );
    
          if( mentions.length > 50 ) {
            mentions = mentions.slice( 0, 50 );
          }
    
          let name = ( results[r].nickname ? results[r].nickname : results[r].first ) + ' ' + results[r].last;
    
          tweets.push( {
            name: name,
            text: results[r].text,
            link: `https://twitter.com/${results[r].twitter}/status/${results[r].twitter_id}`,
            photo: results[r].photo,
            created_at: results[r].created_at
          } );
    
          if( !hours[results[r].created_at.getHours()] ) {
            hours[results[r].created_at.getHours()] = 1;
          } else {
            hours[results[r].created_at.getHours()] = hours[results[r].created_at.getHours()] + 1;
          }
    
          let formatted = `${results[r].created_at.getFullYear()}-${results[r].created_at.getMonth() + 1}-${results[r].created_at.getDate()}`;
    
          if( !date[formatted] ) {
            date[formatted] = 1;
          } else {
            date[formatted] = date[formatted] + 1;        
          }
    
          if( !days[results[r].created_at.getDay()] ) {
            days[results[r].created_at.getDay()] = 1;
          } else {
            days[results[r].created_at.getDay()] = days[results[r].created_at.getDay()] + 1;        
          }
        }
    
        query = 
          'SELECT url ' + 
          'FROM Media ' +
          'WHERE created_at >= \'' + start + '\'' + 
          'ORDER BY created_at DESC'
    
        connection.query( query, ( err, results, fields ) => {
          if( err ) {
            throw error;
          } 
    
          for( let m = 0; m < results.length; m++ ) {
            media.push( results[m].url )
          }
          
          connection.end(); 

          resolve( {
            media: media,
            hours: hours,
            days: days,
            date: date,
            tweets: tweets.slice( 0, 100 ),
            mentions: mentions
          } );
        } );
      } );
    } );  
  } );  
}

module.exports.main = main;
