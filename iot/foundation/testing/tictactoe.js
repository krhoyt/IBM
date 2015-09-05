// Packages
var jsonfile = require( 'jsonfile' );
var mqtt = require( 'mqtt' );
var path = require( 'path' );

// Configuration
var configuration = jsonfile.readFileSync( path.join( __dirname, 'configuration.json' ) );

// Connection parameters
// Format: a:org_id:app_id
// URI: org_id.messaging.internetofthings.ibmcloud.com
var id = 
	'a:' + 
	configuration.organizationId + ':' + 
	'TicTacToe';
var uri = 
	'tcp://' + 
	configuration.uri + ':' + 
	'1883';

// Debug
console.log( id );
console.log( uri );

// Connect
var client = mqtt.connect( uri, {
	clientId: id,
	clean: true,
	username: configuration.keys[1].apiKey,
	password: configuration.keys[1].authenticationToken
} ); 
  
// Counter 
var count = 0;  
  
// Connected
client.on( 'connect', function() {
	// Debug
	console.log( 'Connected.' );
		
	// Incrementally publish
	setInterval( function() {
		var blue = null;
		var data = null;
		var green = null;
		var led = null;
		var red = null;
		var topic = null;
		
		// Increment counter
		count = count + 1;
		
		// Randomly select colors
		red = Math.round( Math.random() * 255 );
		green = Math.round( Math.random() * 255 );
		blue = Math.round( Math.random() * 255 );				
		
		// Randomly select LED
		led = Math.floor( Math.random() * 9 );		
		
		// Build object to send
		// Single 'd' property
		data = {
			d: {
				change: led + ',' + red + ',' + green + ',' + blue
			}
		};
		
		topic = 
			'iot-2/type/' +
			configuration.devices[0].deviceType + '/' +
			'id/' +
			configuration.devices[0].deviceId + '/' +
			'cmd/tictactoe/fmt/json';
						
		// Publish object
		// JSON string
		// Topic: iot-2/type/device_type/id/device_id/cmd/command_id/fmt/format_string
		client.publish( topic, JSON.stringify( data ), function() {
			console.log( data );
		} );
	}, 1000 ); 
} );
 
// Message
client.on( 'message', function( topic, message ) {
	console.log( message.toString() );
} );
