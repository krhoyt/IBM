// Constants
var CONFIGURATION_FILE = 'configuration.json';
var PUBNUB_CHANNEL = 'weather_channel';
var SYMBOL_DEGREE = '&deg;';
var SYMBOL_PERCENT = '%'; 
var TICK_RATE = 1000;
var WEATHER_SERVICE = '/reading?limit=1';

// Color for temperature
var COLOR_RANGES = [
	{low: -20, high: -7, src: 'icicles.jpg'},
	{low: -6, high: 7, src: 'snow.jpg'},
	{low: 8, high: 21, src: 'field.jpg'},
	{low: 22, high: 35, src: 'beach.jpg'}
];

// Application
var configuration = null;
var ibmcloud = null;
var interval = null;
var latest = null;
var pubnub = null;
var xhr = null;

// Called to update the clock
// Represents time since last update
function clock() 
{
	var element = null;
	var timestamp = null;
	
	// Moment for formatting
	timestamp = moment( latest );
	
	// Update user interface
	element = document.querySelector( '.timestamp' );
	element.innerHTML = 'Updated ' + timestamp.fromNow() + '.';
			
	// Keep updating time since last update
	if( interval == null )
	{
		interval = setInterval( clock, TICK_RATE );
	}			
}

// Called to update weather conditions
function update( data )
{
	var element = null;
	var timestamp = null;

	// Debug
	if( arguments.length > 1 ) 
	{
		console.log( 'PubNub update.' );		
	} else {
		console.log( 'Cloud Code update.' );
	}

	// Background
	for( var c = 0; c < COLOR_RANGES.length; c++ )
	{
		// Map temperature to static ranges
		if( data.celcius >= COLOR_RANGES[c].low && data.celcius <= COLOR_RANGES[c].high )
		{		
			element = document.querySelector( '.background' );			
			
			// Only update image if needed	
			if( element.style.backgroundImage.indexOf( COLOR_RANGES[c].src ) < 0 )
			{
				element.style.backgroundImage = 'url( img/' + COLOR_RANGES[c].src + ' )';				
			}
		
			break;
		}			
	}

	// Circle
	element = document.querySelector( '.circle' );
	element.style.visibility = 'visible';
	
	// Temperature
	element = document.querySelector( '.circle p:first-of-type' );
	element.innerHTML = Math.round( data.fahrenheit ) + SYMBOL_DEGREE;
	
	// Humidity
	element = document.querySelector( '.circle p:last-of-type' );
	element.innerHTML = Math.round( data.humidity ) + SYMBOL_PERCENT;
	
	// Track time passed since last update
	latest = data.timestamp * 1000;
	clock();
	
	// Start tracking feed
	// Publish-subscribe
	if( pubnub == null )
	{
		// Initialize
		pubnub = PUBNUB( configuration.pubnub );
	
		// Subscribe	
		pubnub.subscribe( {
			channel: PUBNUB_CHANNEL,
			message: update	
		} );
	}	
}

// Called when configuration is loaded
// Initialize IBM Bluemix
// Initialize IBM Cloud Code
// Get initial weather display
function doConfigurationLoad()
{
	// Debug
	console.log( 'Configuration.' );
	
	// Set configuration details
	configuration = JSON.parse( xhr.responseText );
	
	// Bluemix
	IBMBluemix.initialize( configuration.bluemix );
		
	// Cloud Code
	ibmcloud = IBMCloudCode.initializeService();	

	// Get initial weather from server
	ibmcloud.get( WEATHER_SERVICE ).then( function( results ) {
		var data = null;

		// Debug
		console.log( 'Cloud Code.' );

		// Parse JSON results
		data = JSON.parse( results );

		// Update user interface
		update( data.docs[0] );
	},
	function( error ) {
	    console.log( error );
	} );	
	
	// Clean up
	xhr.removeEventListener( 'load', doConfigurationLoad );
	xhr = null;
}

// Called when document is loaded
// Loads external configuration
// Layout user inteface
function doWindowLoad()
{
	// Debug
	console.log( 'Load.' );

	// Load configuration
	xhr = new XMLHttpRequest();
	xhr.addEventListener( 'load', doConfigurationLoad );
	xhr.open( 'GET', CONFIGURATION_FILE );
	xhr.send( null );

	// Layout user interface
	doWindowResize();
}

// Called to layout the user interface
function doWindowResize()
{
	var background = null;
	var circle = null;
	var humidity = null;
	var temperature = null;
	
	// Background image
	background = document.querySelector( '.background' );
	background.style.width = window.innerWidth + 'px';
	background.style.height = window.innerHeight + 'px';
	
	// Containing circle
    circle = document.querySelector( '.circle' );
    circle.style.height = Math.round( window.innerHeight * 0.45 ) + 'px';
    circle.style.width = Math.round( window.innerHeight * 0.45 ) + 'px';
    circle.style.borderRadius = Math.round( window.innerHeight * 0.45 ) + 'px';
    circle.style.left = Math.round( ( window.innerWidth - circle.clientWidth ) / 2 ) + 'px';
    circle.style.top = Math.round( ( window.innerHeight - circle.clientHeight ) / 2 ) + 'px';	

    // Temperature
    temperature = document.querySelector( '.circle p:first-of-type' );
    temperature.style.fontSize = Math.round( circle.clientHeight * 0.40 ) + 'px';
    temperature.style.top = Math.round( circle.clientHeight * 0.15 ) + 'px';
	
    // Humidity
    humidity = document.querySelector( '.circle p:last-of-type' );
    humidity.style.fontSize = Math.round( circle.clientHeight * 0.12 ) + 'px';
    humidity.style.top = Math.round( circle.clientHeight * 0.70 ) + 'px';        	    
}

// Document loaded
window.addEventListener( 'load', doWindowLoad );
window.addEventListener( 'resize', doWindowResize );
