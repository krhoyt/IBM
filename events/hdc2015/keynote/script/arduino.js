// Constants
var PHOTOCELL_MAX = 1024;
var SWITCH_OFF = 0;
var SWITCH_ON = -300;
    
// Application
var socket = null;
var state = null;
var touch = false;
    
// Reference
var led = null;    
var gauge = null;
    
function doSwitchClick() {
	if ( state ) {
		// Turn the light switch off
		// Update state reference
		led.style.backgroundPosition = SWITCH_OFF + 'px';
		state = 0;
	} else {
		// Turn the light switch on
		led.style.backgroundPosition = SWITCH_ON + 'px';
		state = 1;
	}    
    
    // Call the device    
    socket.send( state );
}

function doSocketMessage( event ) {
    // Debug
    console.log( 'Socket message: ' + event.data );
    
    // Refresh display
    gauge.refresh( Math.round( ( event.data / PHOTOCELL_MAX ) * 100 ), 100 );    
}

function doSocketOpen() {
    // Debug
    console.log( 'Socket open.' );
    
    // Listen for click to call
    led.addEventListener( touch ? 'touchstart' : 'click', doSwitchClick );
    
    // Listen for data
    socket.addEventListener( 'message', doSocketMessage );
}

function doWindowLoad() {
    // Debug
    console.log( 'Window load.' );    
    
    // Touch support
    touch = ( 'ontouchstart' in document.documentElement ) ? true : false;    
    
    // Seed LED as off
    state = 0;
    
    // Quick reference versus repeated lookup
    led = document.querySelector( '.led' );
    gauge = new JustGage( {
        parentNode: document.querySelector( '.photocell' ),
        value: 0,
        min: 0,
        max: 100,
        symbol: '%',
        refreshAnimationTime: 1000,
        hideMinMax: true
    } );
    
    // WebSocket
    socket = new WebSocket( 'ws://localhost:8080' );
    socket.addEventListener( 'open', doSocketOpen );
    
    // Layout
    doWindowResize();
}
    
function doWindowResize() {
    var controls = null;
    
    // Debug
    console.log( 'Resize.' );
    
    // Center controls in viewport
    controls = document.querySelector( '.controls' );
    controls.style.left = Math.round( ( window.innerWidth - controls.clientWidth ) / 2 ) + 'px';
    controls.style.top = Math.round( ( window.innerHeight - controls.clientHeight ) / 2 ) + 'px';
    controls.style.visibility = 'visible';
}
    
// Go
window.addEventListener( 'load', doWindowLoad );
window.addEventListener( 'resize', doWindowResize );
