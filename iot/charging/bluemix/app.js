var cfenv = require( 'cfenv' );
var express = require( 'express' );
var mqtt = require( 'mqtt' );

// Charging counter
var count = 0;
var interval = null;

// Application
// Just here to keep Node running
var app = express();

// Static for main files
app.use( '/', express.static( 'public' ) );

// Bluemix
var env = cfenv.getAppEnv();

// Listen
var server = app.listen( env.port, env.bind, function() {
  // Debug
  console.log( 'Started on: ' + env.port );
} );

// Connect to Watson IoT
var client  = mqtt.connect( 
  'mqtt://ts200f.messaging.internetofthings.ibmcloud.com', 
  {
    clientId: 'a:ts200f:Charger_' + Math.round( ( Math.random() * 10000 ) ),
    username: 'a-ts200f-u91rx19z9o',
    password: '5vWhBLEx*cR49Z+OEs',
    port: 1883
  }
);

// Connected to Watson
// Subscribe to relevant topics
client.on( 'connect', function() {
  console.log( 'Connected to Watson IoT.' );

  // Authenticate
  client.subscribe( 'iot-2/type/iOS/id/Charger/evt/login/fmt/json', function( error, granted ) {
    console.log( 'Subscribed to authenticate.' );
  } );

  // Start charging
  client.subscribe( 'iot-2/type/iOS/id/Charger/evt/start/fmt/json', function( error, granted ) {
    console.log( 'Subscribed to charge.' );
  } ); 

  // Stop charging
  client.subscribe( 'iot-2/type/iOS/id/Charger/evt/stop/fmt/json', function( error, granted ) {
    console.log( 'Subscribed to stop charging.' );
  } ); 
} );

// New message arrived
client.on( 'message', function( topic, message ) {
  var data = null;

  // Parse JSON
  data = JSON.parse( message.toString() );
  
  // Debug
  // If you need to see the message contents
  // console.log( data );  

  switch( topic ) {
    // Authenticate
    case 'iot-2/type/iOS/id/Charger/evt/login/fmt/json':
      // Authenticate against Google using API (HTTP)
      console.log( 'Authenticate.' );

      // Then
      client.publish( 
        'iot-2/type/iOS/id/Charger/evt/authenticated/fmt/json',
        JSON.stringify( {
          token: 'abc123',
          valid: true
        } )
      );    

      break;

    // Start charging
    case 'iot-2/type/iOS/id/Charger/evt/start/fmt/json':
      console.log( 'Start charging.' );

      // Start counting
      // As if charging
      count = 0;
      interval = setInterval( function() {
        console.log( count );
        count = count + 1;
        client.publish( 
          'iot-2/type/iOS/id/Charger/evt/status/fmt/json',
          JSON.stringify( {
            count: count
          } )
        );            
      }, 1000 );

      break;

    // Stop charging
    case 'iot-2/type/iOS/id/Charger/evt/stop/fmt/json':
      console.log( 'Stop charging.' )

      // Stop counting
      clearInterval( interval );

      // Confirm stop
      client.publish( 
        'iot-2/type/iOS/id/Charger/evt/stopped/fmt/json',
        JSON.stringify( {
          last: count
        } )
      );            

      // Clean up
      interval = null;
      count = 0;

      break;      
  }
} );
