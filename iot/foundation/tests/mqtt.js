// Packages
var mqtt = require( 'mqtt' );

// Constant
var MQTT_BROKER = 'ws://mosca.mybluemix.net';
var MQTT_TOPIC = 'test';

// Client
var client = mqtt.connect( MQTT_BROKER ); 
 
// Connection
// Send test
client.on( 'connect', function() {
  client.subscribe( MQTT_TOPIC );
  client.publish( MQTT_TOPIC, 'Hello MQTT!' );
} );
 
// Message
client.on( 'message', function( topic, message ) {
  console.log( message.toString() );
} );
