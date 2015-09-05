// Packages
var SerialPort = require( 'serialport' );

// List ports
// Informational purposes
SerialPort.list( function( err, ports ) {
	ports.forEach( function( port ) {
		console.log( port.comName );
    } );
} );

/*
// Connect to serial port
// Look for newline delimiter
var serial = new SerialPort.SerialPort( '/dev/cu.usbmodem1411', {
	parser: SerialPort.parsers.readline( '\n' ) 	
} );

// Serial data arrived
serial.on( 'data', function( data ) {
	// Send to console for debugging
	console.log( data );
} );
*/
