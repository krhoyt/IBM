// Constants
var EVENT_PHOTOCELL = 'photocell';
var FUNCTION_LED = 'led';
var PHOTOCELL_MAX = 3450;
var SWITCH_OFF = 0;
var SWITCH_ON = -300;
    
// Application
var authentication = null;
var device = null;
var state = null;
var touch = false;
    
// Reference
var led = null;    
var gauge = null;

function doSparkCalled( error, data ) {
    // Debug
    console.log( 'Called.' );
    
    // Display
    console.log( data );
}    
    
function doSparkDevices( err, devices ) {
    // Debug
    console.log( 'Devices.' );

    // Find connected device
    for ( var d = 0; d < devices.length; d++ ) {
        if ( devices[d].connected ) {
            // Debug
            console.log( devices[d] );

            // Keep around for reference
            device = devices[d];
            break;
        }
    }
    
    // Listen for event
    // For specific device
    // Could be across all devices
    device.onEvent( EVENT_PHOTOCELL, doSparkEvent );    
}    
    
function doSparkEvent( event ) {
    // Debug
    console.log( 'Event.' );

    // Display
    console.log( 'Photocell: ' + event.data );
    
    // Refresh display
    gauge.refresh( Math.round( ( ( PHOTOCELL_MAX - event.data ) / PHOTOCELL_MAX ) * 100 ), 100 );
}    
    
function doSparkLogin( error, authentication ) {
    // Debug
    console.log( 'Login.' );

    // Keep around for reference
    this.authentication = authentication;

    // List devices
    spark.listDevices( doSparkDevices );

    // Listen for click to call
    led.addEventListener( touch ? 'touchstart' : 'click', doSwitchClick );
}    
    
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
    device.callFunction( FUNCTION_LED, state.toString(), doSparkCalled );    
}

function doWindowLoad() {
    // Debug
    console.log( 'Load.' );    
    
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
    
    // Login to Particle
    spark.login( {
        username: configuration.username,
        password: configuration.password
    }, doSparkLogin );
    
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
