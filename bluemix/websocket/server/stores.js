var amazon = require( 'amazon-product-api' );
var jsonfile = require( 'jsonfile' );
var path = require( 'path' );
var SerialPort = require( 'serialport' );
var WebSocket = require( 'ws' ); 

// Configuration
var configuration = jsonfile.readFileSync( path.join( __dirname, 'configuration.json' ) );

// Amazon client
var client = amazon.createClient( {
    awsId: configuration.amazonId,
    awsSecret: configuration.amazonSecret,
    awsTag: configuration.amazonTag
} );

// WebSocket client
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
var serial = new SerialPort.SerialPort( '/dev/cu.usbmodem010811', {
	parser: SerialPort.parsers.readline( '\r' ) 	
} );

// Serial data arrived
serial.on( 'data', function( data ) {
	// Send to console for debugging
	console.log( data );
    
    // Call Amazon
    client.itemLookup( {
        idType: 'UPC',
        itemId: data,
        responseGroup: 'Medium, Images'
    } ).then( function( results ) {
        var message = null;

        // Assemble details
        message = {
            action: 'barcode_show',
            upc: data,
            title: results[0].ItemAttributes[0].Title[0].trim(),
            image: results[0].ImageSets[0].ImageSet[0].LargeImage[0].URL[0].trim(),
            price: parseInt( results[0].OfferSummary[0].LowestNewPrice[0].Amount[0] ) / 100
        };

        // Debug
        console.log( message );
        
        // Connected to socket
        if( open ) {
            // Send message
            socket.send( JSON.stringify( message ) );        
        }        
    } ).catch( function( error ) {
        console.log( error );
    } );    
} );
