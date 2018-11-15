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
    connection.connect( function( err ) {
      if( err ) {
        throw err;
      } 

      console.log( 'Connected.' );

      let today = new Date();
      today.setDate( today.getDate() - 31 );
  
      let start = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    
      let query = 
        'SELECT * ' +
        'FROM Media ' +
        'WHERE created_at >= \'' + start + '\' ' +
        'ORDER BY created_at DESC';    

      connection.query( query, ( err, results, fields ) => {
        if( err ) {
          throw error;
        } 

        console.log( 'Query: ' + results.length + ' rows' );

        photos = [];

        for( let p = 0; p < results.length; p++ ) {
          photos.push( results[p].url );
        }
        
        resolve( {
          photos: photos  
        } );
      } );
    } );  
  } );  
}

module.exports.main = main;
