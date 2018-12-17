async function profile( params ) {
  const fs = require( 'fs' );  
  const mysql = require( 'mysql' );
  const util = require( 'util' );
  
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

  const sql = 
    'SELECT ' + 
      'Advocate.id AS internal_id, ' +
      'Advocate.uuid AS id, ' +
      'Team.uuid AS team_id, ' +
      'Team.name AS team_name, ' +
      'Organization.uuid AS organization_id, ' +
      'Organization.name AS organization_name, ' +
      'Advocate.first AS first_name, ' +
      'Advocate.last AS last_name, ' +
      'Advocate.nickname, ' +
      'Advocate.email, ' +
      'Advocate.photo, ' +
      'Advocate.hired AS hired_at, ' +
      'Advocate.birthday AS birthday_at, ' +
      'Advocate.latitude, ' +
      'Advocate.longitude, ' +
      'Advocate.notes ' +
    'FROM Advocate, Organization, Team ' +
    'WHERE Advocate.team_id = Team.id ' +
    'AND Team.organization_id = Organization.id ' +
    'AND Advocate.email = ?';

  const record = await query( sql, params.email );
  let result = {};

  if( record.length > 0 ) {
    result = record[0];
    result.skills = await query( 
      'SELECT Technology.uuid AS id, Technology.name ' +
      'FROM Advocate, Skills, Technology ' +
      'WHERE Technology.id = Skills.technology_id ' +
      'AND Skills.advocate_id = Advocate.id ' +
      'AND Advocate.id = ?', record[0].internal_id 
    );  
    result.blog = await query( 'SELECT uuid AS id, url, feed FROM Blog WHERE advocate_id = ?', record[0].internal_id );
    result.youtube = await query( 'SELECT uuid AS id, channel_id FROM YouTube WHERE advocate_id = ?', record[0].internal_id );
    result.twitter = await query( 'SELECT uuid AS id, screen_name FROM Twitter WHERE advocate_id = ?', record[0].internal_id );  
    result.github = await query( 'SELECT uuid AS id, github_id FROM GitHub WHERE advocate_id = ?', record[0].internal_id );  
    result.so = await query( 'SELECT uuid AS id, user_id FROM StackOverflow WHERE advocate_id = ?', record[0].internal_id );    
  
    delete result.internal_id;
  }

  connection.end();  

  return {
    headers: { 
      'Content-Type': 'application/json' 
    },
    statusCode: 200,
    body: result
  };
}

exports.main = profile;
