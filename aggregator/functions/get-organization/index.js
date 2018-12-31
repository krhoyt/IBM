async function report( params ) {
  // Libraries
  const fs = require( 'fs' );
  const mysql = require( 'mysql' );
  const util = require( 'util' );  
  
  // MySQL
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

  // Connect
  connection.connect();

  // Promisify
  const query = util.promisify( connection.query ).bind( connection );

  // Query
  let organization = await query( 
    'SELECT ' +
    'Team.uuid AS team_id, ' +
    'Team.name AS team_name, ' +
    'Advocate.uuid AS advocate_id, ' +
    'Advocate.first, ' +
    'Advocate.last, ' +
    'Advocate.nickname, ' +
    'Advocate.email, ' +
    'Advocate.photo, ' +
    'Advocate.latitude, ' +
    'Advocate.longitude ' +
    'FROM Advocate, Organization, Team ' +
    'WHERE Advocate.team_id = Team.id ' +
    'AND Team.organization_id = Organization.id ' +
    'AND Organization.uuid = ? ' +
    'ORDER BY Team.name, Advocate.last',
    params.id
  );

  // Close
  connection.end();  

  // Results
  return {
    headers: { 
      'Content-Type': 'application/json' 
    },
    statusCode: 200,
    body: organization
  };
}

exports.main = report;
