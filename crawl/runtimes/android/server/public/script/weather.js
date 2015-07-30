// Constant
var APPLICATION_ID = '_YOUR_APPLICATION_ID_';
var APPLICATION_ROUTE = '_YOUR_APPLICATION_ROUTE_';
var APPLICATION_SECRET = '_YOUR_APPLICATION_SECRET_';
var ICON_EXTENSION = '.svg';
var ICON_PATH = 'img/icon/';
var IMAGE_EXTENSION = '.jpg';
var IMAGE_PATH = 'img/scene/';
var LATITUDE = 'latitude';
var LONGITUDE = 'longitude';
var UPDATE_RATE = 60000;
var WEATHER_ROOT = "/weather";
    
// Global
var cloud = null;
var interval = null;
var latitude = null;
var longitude = null;
    
// Calls Cloud Code to get weather
// HTTP GET wth location on query string
function weather()
{
	var url = null;
	
	// URL for service
	url = WEATHER_ROOT + "?" + LATITUDE + "=" + latitude + "&" + LONGITUDE + "=" + longitude;
	
	// Call service
	cloud.get( url ).then( doWeatherLoad, doWeatherError );
}

// Problem access geolocation
// Could be the user declined access
// Could be the feature is not present
function doLocationError( message )
{
    var status = null;
  
    // Display message
    status = typeof msg == 'string' ? msg : 'Geolocation access failed.';
    console.log( status );
}
    
// Called when geolocation has been resolved
// Store location globally
// Lookup weather data
function doLocationSuccess( position )
{
    // Debug
    console.log(
        position.coords.latitude + 
        ', ' +
        position.coords.longitude
    );
 
    // Location
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;

    // Get weather
    weather();
}

// Problem calling Cloud Code
function doWeatherError( error )
{
	console.log( error );
}
    
// Called when weather has been loaded
// Populates display fields with data
function doWeatherLoad( response )
{
    var conditions = null;
    var data = null;
    var icon = null;
    var location = null;
    var range = null;
    var summary = null;
    var temperature = null;
    var weather = null;
    
    // Debug
    console.log( response );
    
    // Check periodically
    if( interval == null )
    {
        interval = setInterval( weather, UPDATE_RATE );    
    }
    
    // Decode data
    data = JSON.parse( response );
    
    // Large background image
    weather = document.querySelector( '.weather' );
    weather.style.backgroundImage = 'url( ' + IMAGE_PATH + data.icon + IMAGE_EXTENSION + ' )';
    
    // Vector icon
    icon = document.querySelector( '.icon' );
    icon.style.backgroundImage = 'url( ' + ICON_PATH + data.icon + ICON_EXTENSION + ' )';
    
    // Temperature
    temperature = document.querySelector( '.temperature' );
    temperature.innerHTML = Math.round( data.temperature ) + '&deg;';
    
    // Textual display
    summary = document.querySelector( '.summary' );
    summary.innerHTML = data.summary;    
    
    // High and low range
    range = document.querySelector( '.range' );
    range.children[0].innerHTML = Math.round( data.maximum ) + '&deg';        
    range.children[1].innerHTML = '/' + Math.round( data.minimum ) + '&deg';            
    
    // Location name
    location = document.querySelector( '.location' );
    location.innerHTML = data.city + ', ' + data.state;
    
    // Show if not already visible
    conditions = document.querySelector( '.conditions' );
    conditions.style.visibility = 'visible';
}
    
// Called when the page loads
// Initializes Mobile Cloud Services
// Starts acquiring location
// Performs initial layout
function doWindowLoad()
{
	// Mobile Cloud Services
	IBMBluemix.initialize( {
		applicationId: APPLICATION_ID,
		applicationRoute: APPLICATION_ROUTE,
		applicationSecret: APPLICATION_SECRET
	} );
	
	// Cloud Code
	cloud = IBMCloudCode.initializeService();
	
    // Geolocation
	// Timeout clears stack
	// Avoids Safari implementation bug
	setTimeout( function() {
	    if( navigator.geolocation ) 
	    {
	        navigator.geolocation.getCurrentPosition( 
	            doLocationSuccess, 
	            doLocationError 
	        );
	    } else {
	        doLocationError( 'Geolocation not supported.' );
	    }            		
	}, 1000 );
    
    // Layout
    doWindowResize();
}
    
// Layout weather display
// Metrics based on screen size
function doWindowResize()
{
    var conditions = null;
    var icon = null;
    var location = null;
    var range = null;
    var summary = null;
    var temperature = null;
    
    // Circle containing weather data
    conditions = document.querySelector( '.conditions' );
    conditions.style.height = Math.round( window.innerHeight * 0.45 ) + 'px';
    conditions.style.width = Math.round( window.innerHeight * 0.45 ) + 'px';
    conditions.style.borderRadius = Math.round( window.innerHeight * 0.45 ) + 'px';
    conditions.style.left = Math.round( ( window.innerWidth - conditions.clientWidth ) / 2 ) + 'px';
    conditions.style.top = Math.round( ( window.innerHeight - conditions.clientHeight ) / 2 ) + 'px';

    // Vector icon
    icon = document.querySelector( '.icon' );
    icon.style.height = Math.round( conditions.clientHeight * 0.15 ) + 'px';
    icon.style.top = Math.round( conditions.clientHeight * 0.10 ) + 'px';        
    
    // Large temperature
    temperature = document.querySelector( '.temperature' );
    temperature.style.fontSize = Math.round( conditions.clientHeight * 0.30 ) + 'px';
    temperature.style.top = Math.round( conditions.clientHeight * 0.25 ) + 'px';    
    
    // Textual description
    summary = document.querySelector( '.summary' );
    summary.style.fontSize = Math.round( conditions.clientHeight * 0.08 ) + 'px';
    summary.style.top = Math.round( conditions.clientHeight * 0.65 ) + 'px';        
    
    // High and low temperatures for the day
    range = document.querySelector( '.range' );
    range.style.fontSize = Math.round( conditions.clientHeight * 0.05 ) + 'px';
    range.style.top = Math.round( conditions.clientHeight * 0.80 ) + 'px';            
    range.style.left = Math.round( ( conditions.clientWidth - range.clientWidth ) / 2 ) + 'px';
    
    // Textual location
    location = document.querySelector( '.location' );
    location.style.fontSize = Math.round( window.innerHeight * 0.05 ) + 'px';
    location.style.top = Math.round( window.innerHeight * 0.05 ) + 'px';        
}
    
// Get this party started
window.addEventListener( 'load', doWindowLoad );   
window.addEventListener( 'resize', doWindowResize );
