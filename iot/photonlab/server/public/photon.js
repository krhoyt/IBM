// WebSocket
var socket = null;
    
// Message arrived
function doSocketMessage( event ) {
    var colon = null;
    var data = null;
    var device = null;
    var element = null;
    var reading = null;
    
    // Debug
    console.log( event.data );
    
    // Parse
    data = JSON.parse( event.data );
    
    // Device
    device = document.createElement( 'span' );
    device.innerHTML = data.device;
    
    // Colon for readability
    colon = document.createElement( 'span' );
    colon.innerHTML = ' : ';
    
    // Reading value
    reading = document.createTextNode( data.reading );
    
    // Build element
    element = document.createElement( 'p' );
    element.setAttribute( 'data-id', data._id );
    element.appendChild( device );
    element.appendChild( colon );
    element.appendChild( reading );
    
    // Add to document
    document.body.appendChild( element );
}

// Socket is open
function doSocketOpen() {
    // Debug
    console.log( 'Socket open.' );
    
    // Listen for messages
    socket.addEventListener( 'message', doSocketMessage );
}
    
// Window loaded
function doWindowLoad() {
    // Debug
    console.log( 'Window load.' );
    
    // Start WebSocket
    // Listen for open
    socket = new WebSocket( 'ws://' + window.location.host );
    socket.addEventListener( 'open', doSocketOpen );
}
    
// Go
window.addEventListener( 'load', doWindowLoad );    
