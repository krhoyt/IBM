// Packages
var SerialPort = require( 'serialport' );
var WebSocket = require( 'ws' );

// List ports
// Informational purposes
SerialPort.list( function( err, ports ) {
	ports.forEach( function( port ) {
		console.log( port.comName );
    } );
} );

// Socket
// var socket = new WebSocket( 'ws://sockets.mybluemix.net' );
var socket = new WebSocket( 'ws://localhost:6004' );
var open = false;

// Connected
socket.on( 'open', function() {
    // Debug
    console.log( 'WebSocket connected.' );
    
    // Track connection
    open = true;
} );

// Connect to serial port
// Look for newline delimiter
var serial = new SerialPort.SerialPort( '/dev/cu.usbmodem1411', {
	parser: SerialPort.parsers.readline( '\n' ) 	
} );

// Serial data arrived
serial.on( 'data', function( data ) {
    var message = null;
    
	// Send to console for debugging
	console.log( data );
    
    // Connected to socket
    if( open ) {
        // Assemble message
        message = {
            action: 'photocell',
            value: parseInt( data.trim() )
        };

        // Send message
        socket.send( JSON.stringify( message ) );        
    }
} );
