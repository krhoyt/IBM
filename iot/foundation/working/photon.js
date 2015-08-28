// Packages
var jsonfile = require( 'jsonfile' );
var mqtt = require( 'mqtt' );
var path = require( 'path' );

// Configuration
var configuration = jsonfile.readFileSync( path.join( __dirname, 'configuration.json' ) );

// Connection parameters
// Format: a:org_id:app_id
// URI: org_id.messaging.internetofthings.ibmcloud.com
var clientId = 'a:asu2l5:nodejs';
var uri = 
	configuration.protocol + 
	configuration.organizationId + '.' + 
	configuration.iotFoundation + ':' + 
	configuration.port;

// Connect
var client = mqtt.connect( uri, {
	clientId: clientId,
	clean: true,
	username: configuration.apiKey,
	password: configuration.apiToken
} ); 
  
// Counter 
var count = 0;  

// Connected
client.on( 'connect', function() {
	console.log( 'Connected.' );
	
	// Subscribe
	// event_id can be '+' wildcard
	// Event topic: iot-2/type/device_type/id/device_id/evt/event_id/fmt/format_string
	// Command topic: iot-2/type/device_type/id/device_id/cmd/command_id/fmt/format_string
	client.subscribe( 'iot-2/type/Photon/id/286cb6fb/evt/testing/fmt/json', function( error, granted ) {
		if( error )
		{
			console.log( error );
		} else {
			console.log( granted );
		}
	} );
	
	// Incrementally publish
	setInterval( function() {
		var data = null;
		
		// Increment counter
		count = count + 1;
		
		// Build object to send
		// Single 'd' property
		data = {
			d: {
				status: 'ON',
				red: 255,
                green: 0,
                blue: 0
			}
		};
		
		// Publish object
		// JSON string
		// Topic: iot-2/type/device_type/id/device_id/cmd/command_id/fmt/format_string
		client.publish( 'iot-2/type/Photon/id/286cb6fb/cmd/testing/fmt/json', JSON.stringify( data ), function() {
			console.log( data );
		} );
	}, 10000 ); 
} );
 
// Message
client.on( 'message', function( topic, message ) {
	console.log( message.toString() );
} );
