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
	'Standalone';
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
	var topic = null;
	
	// Debug
	console.log( 'Connected.' );
	
	topic = 
		'iot-2/type/' +
		configuration.devices[1].deviceType + '/' +
		'id/' +
		configuration.devices[1].deviceId + '/' +
		'evt/testing/fmt/json';
	
	// Debug
	console.log( topic );
	
	// Subscribe
	// event_id can be '+' wildcard
	// Event topic: iot-2/type/device_type/id/device_id/evt/event_id/fmt/format_string
	// Command topic: iot-2/type/device_type/id/device_id/cmd/command_id/fmt/format_string
	client.subscribe( topic, function( error, granted ) {
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
		var topic = null;
		
		// Increment counter
		count = count + 1;
		
		// Build object to send
		// Single 'd' property
		data = {
			d: {
				count: count,
				source: 'application'
			}
		};
		
		topic = 
			'iot-2/type/' +
			configuration.devices[1].deviceType + '/' +
			'id/' +
			configuration.devices[1].deviceId + '/' +
			'cmd/testing/fmt/json';
						
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
