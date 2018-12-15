const bread = ( params ) => {
  const fs = require( 'fs' );  
  const mysql = require( 'mysql' );

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

  if( params.__ow_method == 'get' ) {
    if( params.id ) {
      return read( connection, params.path, params.id );
    } else {
      return browse( connection, params.path );
    }
  } else if( params.__ow_method == 'post' ) {
    return add( connection, params.path, params.record );
  } else if( params.__ow_method == 'put' ) {
    return edit( connection, params.path, params.record );
  } else if( params.__ow_method == 'delete' ) {
    return remove( connection, params.path, params.id );
  }
}

const browse = ( connection, path ) => {
  return new Promise( ( resolve, reject ) => {
    connection.query( `SELECT * FROM ${path}`, ( err, rows ) => {  
      if( err ) throw err;
    
      connection.end();
  
      resolve( {
        headers: { 
          'Content-Type': 'application/json' 
        },
        statusCode: 200,
        body: rows
      } );
    } );
  } );  
}

const read = ( connection, path, id ) => {
  return new Promise( ( resolve, reject ) => {
    connection.query( `SELECT * FROM ${path} WHERE id = ?`, id, ( err, rows ) => {  
      if( err ) throw err;
    
      connection.end();
  
      resolve( {
        headers: { 
          'Content-Type': 'application/json' 
        },
        statusCode: 200,
        body: rows[0]
      } );
    } );
  } );  
}

const edit = ( connection, path, record ) => {
  const id = record.id;
  delete record.id;

  record.updated_at = new Date();

  return new Promise( ( resolve, reject ) => {
    connection.query( `UPDATE ${path} SET ? WHERE id = ? LIMIT 100`, [record, id], ( err, result ) => {  
      if( err ) throw err;
    
      connection.end();
  
      resolve( {
        headers: { 
          'Content-Type': 'application/json' 
        },
        statusCode: 200,
        body: {
          success: result.affectedRows >= 1 ? true : false
        }
      } );
    } );
  } );    
}

const add = ( connection, path, record ) => {
  record.id = null;
  record.created_at = new Date();
  record.updated_at = new Date();

  return new Promise( ( resolve, reject ) => {
    connection.query( `INSERT INTO ${path} SET ?`, record, ( err, result ) => {  
      if( err ) throw err;
    
      connection.end();
  
      resolve( {
        headers: { 
          'Content-Type': 'application/json' 
        },
        statusCode: 200,
        body: {
          id: result.insertId          
        }
      } );
    } );
  } );    
}

const remove = ( connection, path, id ) => {
  return new Promise( ( resolve, reject ) => {
    connection.query( `DELETE FROM ${path} WHERE id = ?`, id, ( err, result ) => {  
      if( err ) throw err;
    
      connection.end();
  
      resolve( {
        headers: { 
          'Content-Type': 'application/json' 
        },
        statusCode: 200,
        body: {
          success: result.affectedRows == 1 ? true : false
        }
      } );
    } );
  } );    
}

exports.main = bread;
