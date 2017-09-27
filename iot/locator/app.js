var cfenv = require( 'cfenv' );
var express = require( 'express' );
var jsonfile = require( 'jsonfile' );
var parser = require( 'body-parser' );
var Particle = require( 'particle-api-js' );
var request = require( 'request' );

// External configuration
config = jsonfile.readFileSync( __dirname + '/config.json' );

// Application
var app = express();

// Middleware
app.use( parser.json() );
app.use( parser.urlencoded( { 
  extended: false 
} ) );

// Per-request actions
app.use( function( req, res, next ) { 
  // Configuration
  req.config = config;
  
  // Just keep swimming
  next();
} );

// Static for main files
app.use( '/', express.static( 'public' ) );

// Bluemix
var env = cfenv.getAppEnv();

// Listen
var server = app.listen( env.port, env.bind, function() {
  // Debug
  console.log( 'Started on: ' + env.port );
} );

// Socket
var io = require( 'socket.io' )( server );

// Paricle
var particle = new Particle();

// Login
particle.login( {
  username: config.particle_username, 
  password: config.particle_password 
} ).then(
  function( data ) {
    // Listen to event stream
    // Specific to my devices
    // Can use device ID if known
    particle.getEventStream( { 
      auth: data.body.access_token,
      deviceId: 'mine',
    } ).then( function( stream ) {
      // Stream event arrived
      stream.on( 'event', function( evt ) {
        // Look for location-specific event
        if( evt.name.startsWith( 'hook-response/' + config.event_name ) ) {
          // Parse out location details
          var parts = evt.data.split( ',' );
          
          // Assemble message
          var msg = JSON.stringify( {
            id: evt.name.split( '/' )[2],
            published: evt.published_at,
            position: {
              lat: parseFloat( parts[0] ),
              lng: parseFloat( parts[1] ),
            },
            accuracy: parseInt( parts[2] )
          } );          

          // Send to clients
          io.emit( 'location', msg );
        }       
      } );
    } );    
  },
  function( err ) {
    console.log( err );
  }
);
