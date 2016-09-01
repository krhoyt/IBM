var jsonfile = require( 'jsonfile' );
var mqtt = require( 'mqtt' );
var SerialPort = require( 'serialport' );

// External configuration
var config = jsonfile.readFileSync( __dirname + '/config.json' );

// Connect to Watson IoT
var client  = mqtt.connect( 
	config.iot_host, 
	{
		clientId: config.iot_client,
		username: config.iot_user,
		password: config.iot_password,
		port: config.iot_port
	}
);    
    
client.on( 'connect', function() {
    // Debug
	// console.log( 'IoT connected.' );
} );

// Open barcode scanner serial port
// Determined by process of elimination
// Use carriage return for terminator
var port = new SerialPort( '/dev/ttyACM0', {
    parser: SerialPort.parsers.readline( '\r' )
} );

port.on( 'open', function() {
    // Debug
    // console.log( 'Port connected.' );
} );

// Barcode scanned
port.on( 'data', function( data ) {
    // Buffer to string
    var code = code = data.toString().trim();
    
    // Debug
    // console.log( code );
    
    // Publish to Watson IoT
	client.publish( config.topic_barcode, JSON.stringify( {
        barcode: code
	} ) );	
} );
