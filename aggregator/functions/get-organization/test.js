const fs = require( 'fs' );
const jsonfile = require( 'jsonfile' );
const mysql = require( 'mysql' );
const util = require( 'util' );  

let params = jsonfile.readFileSync( __dirname + '/config.json' );
params.id = '5c346753-367b-43eb-af77-1623093eae52';

report();

async function report() {
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
    'Organization.name AS organization, ' +
    'Team.uuid AS team_uuid, ' +
    'Team.name, ' +
    'Advocate.uuid AS advocate_uuid, ' +
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
  console.log( organization );
}
