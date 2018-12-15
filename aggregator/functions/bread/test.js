const fs = require( 'fs' );  
const jsonfile = require( 'jsonfile' );
const mysql = require( 'mysql' );

const params = jsonfile.readFileSync( __dirname + '/config.json' );

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

connection.query( 'SELECT * FROM Advocate', ( err, rows ) => {  
  if( err ) throw err;

  connection.end();

  console.log( {
    headers: { 
      'Content-Type': 'application/json' 
    },
    statusCode: 200,
    body: rows
  } );
} );
