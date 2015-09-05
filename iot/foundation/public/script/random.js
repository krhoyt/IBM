// Constants
var CLIENT_PREFIX = 'tictactoe_';
var SOCKET_PROTOCOL = 'ws://';
var TOPIC = 'tictactoe';
    
// Application
var client = null;
var socket = null;    

function doChangeColor() {
    var data = null;

    // Debug
    console.log( 'Change color.' );
    
    // Build changes
    data = {
        client: client,
        topic: TOPIC,
        led: Math.round( Math.random() * 9 ),
        red: Math.round( Math.random() * 255 ),
        green: Math.round( Math.random() * 255 ),
        blue: Math.round( Math.random() * 255 )
    }
    
    // Send changes
    socket.send( JSON.stringify( data ) );
}
    
function doSocketMessage( message ) {
    var data = null
    
    // Debug
    console.log( 'Socket message.' );
    
    // Parse incoming data
    data = JSON.parse( message.data );
    console.log( data );
}
    
function doSocketOpen() {
    var button = null;
    
    // Debug
    console.log( 'Socket open.' );
    
    // Hook up button now that we are connected
    button = document.querySelector( 'button' );
    button.addEventListener( 'click', doChangeColor );
}
    
function doWindowLoad() {
    // Debug
    console.log( 'Load.' );

    // Unique identifier
    client = guid();
    client = client.replace( new RegExp( '-', 'g' ), '' );
    client = CLIENT_PREFIX + client;
    
    // WebSocket
    socket = new WebSocket( SOCKET_PROTOCOL + window.location.host );
    socket.addEventListener( 'open', doSocketOpen );
    socket.addEventListener( 'message', doSocketMessage );        
}
    
// Go    
window.addEventListener( 'load', doWindowLoad );    
