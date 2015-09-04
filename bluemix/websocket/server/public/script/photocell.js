// Constants
var GAUGE_MAX = 100;

// WebSocket
var gauge = null;
var socket = null;

// Message
function doSocketMessage( event ) {
    var body = null;
    
    // Debug
    console.log( event.data );
    
    // Parse
    body = JSON.parse( event.data );
    
    // Update gauge
    gauge.refresh( body.value, GAUGE_MAX );
}
    
// Connected
function doSocketOpen() {
    // Debug
    console.log( 'Socket open.' );
    
    // Listen for messages
    socket.addEventListener( 'message', doSocketMessage );
}
    
// Load
function doWindowLoad() {
    // Debug
    console.log( 'Document loaded.' );
    
    // Prepare gauge
    gauge = new JustGage( {
        id: 'gauge',
        value: 0,
        min: 0,
        max: 100,
        title: 'Photocell'
    } );    
    
    // Connect to server
    // Listen for connection
    socket = new WebSocket( 'ws://' + window.location.host );
    socket.addEventListener( 'open', doSocketOpen );
    
    // Layout
    doWindowResize();
}
    
// Layout
function doWindowResize() {
    var chart = null;
    
    chart = document.querySelector( '#gauge' );
    
    chart.style.left = Math.round( ( window.innerWidth - chart.clientWidth ) / 2 ) + 'px';
    chart.style.top = Math.round( ( window.innerHeight - chart.clientHeight ) / 2 ) + 'px';
}

// Go
window.addEventListener( 'load', doWindowLoad );
window.addEventListener( 'resize', doWindowResize );
