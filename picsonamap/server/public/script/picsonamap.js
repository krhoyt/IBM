// Constants
var CLOUD_BASE_URL = 'http://localhost:3000';
var LIST_COLUMNS = 3;
var LIST_COLUMN_GAP = 4;
var LOCAL_DEVELOPMENT = false;
var MAP_ZOOM = 7;
var PATH_CONFIGURATION = 'configuration.json';
var PUBNUB_CHANNEL = 'picture_channel';
var SERVICE_ATTACHMENT = '/attachment/';
var SERVICE_PICTURE = '/picture';
var SERVICE_PICTURE_LIMIT = '?limit=100';
var SERVICE_ROOT = '/pics-on-a-map/v1/apps/';

// Application
var configuration = null;
var google_maps = null;
var google_markers = null;
var ibmcloud = null;
var info = null;
var latitude = null;
var longitude = null;
var pubnub = null;
var stream = null;
var touch = null;
var xhr = null;

// Called to build initial list
// Configure publish-subscribe
function build() 
{	
	var clone = null;
	var list = null;
	
	// Debug
	console.log( 'Update.' );

	// List
	list = document.querySelector( '.list' );
	
	for( var s = 0; s < stream.length; s++ )
	{
		// Create list element
		clone = create( stream[s] );
				
		// Append to list
		// Most recent appear first
		if( s == 0 )
		{
			list.appendChild( clone );			
		} else {
			list.insertBefore( clone, list.children[0] );
		}	
	}
	
	// Start tracking feed
	// Publish-subscribe
	if( pubnub == null )
	{
		// Initialize
		pubnub = PUBNUB( configuration.pubnub );
	
		// Subscribe	
		pubnub.subscribe( {
			channel: PUBNUB_CHANNEL,
			message: doMessage	
		} );
	}		
}

// Called to create a photo in the stream
// Also creates a marker on the map
// Returns photo item for list
function create( item )
{
	var marker = null;
	var result = null;
	var template = null;
	
	// Debug
	console.log( 'Create: ' + item._id );
	
	// Template
	template = document.querySelector( '.item.template' );
	
	// Build list item
	// TODO: Cloud Code for binary data?
	result = template.cloneNode( true );
	result.setAttribute( 'data-id', item._id );
	result.style.backgroundImage = 
		'url( ' + 
		SERVICE_ROOT + 
		configuration.bluemix.applicationId + 
		SERVICE_ATTACHMENT + 
		item._id + 
		' )';
	result.style.width = Math.round( ( window.innerWidth - ( ( LIST_COLUMNS + 1 ) * LIST_COLUMN_GAP ) ) / LIST_COLUMNS ) + 'px';
	result.style.height = Math.round( ( window.innerWidth - ( ( LIST_COLUMNS + 1 ) * LIST_COLUMN_GAP ) ) / LIST_COLUMNS ) + 'px';		
	result.classList.remove( 'template' );
	result.addEventListener( touch ? 'touchstart' : 'click', doItemClick );
	
	// Marker on map
	// Keep reference to object
	marker = new google.maps.Marker( {
  		position: new google.maps.LatLng(
			item.latitude,
			item.longitude
		),
  		map: google_maps
	} );
	marker.stream = item;
	google_markers.push( marker );
	  
	// Click to show image
	google.maps.event.addListener( marker, 'click', doMarkerClick );
	
	return result;						
}

// Called when configuration file has loaded
// Configures Bluemix integration
// Get initial dataset
// Start geolocation access
function doConfigurationLoad()
{
	// Debug
	console.log( 'Configuration loaded.' );
	
	// Configuration
	configuration = JSON.parse( xhr.responseText );
	
	// Bluemix
	IBMBluemix.initialize( configuration.bluemix );
	
	// Cloud Code
	ibmcloud = IBMCloudCode.initializeService();
	
	// Tell Cloud Code where to look for data
	// Toggle between local and production
	// Uses a boolean flag in the constants
	if( LOCAL_DEVELOPMENT )
	{
		ibmcloud.setBaseUrl( CLOUD_BASE_URL );		
	}
	
	// Fetch current data stream
	ibmcloud.get( SERVICE_PICTURE + SERVICE_PICTURE_LIMIT ).then( function( results )  {
		var data = null;
		
		// Debug
		console.log( 'Cloud Code.' );
		
		// Parse
		data = JSON.parse( results );
		stream = data.docs;
		
		// Initial population of user interface
		build();	
	}, function( error ) {
		console.log( error );
	} );
	
	// Clean up
	xhr.removeEventListener( 'load', doConfigurationLoad );
	xhr = null;
	
	// Geolocation
    if( navigator.geolocation ) 
    {
        navigator.geolocation.getCurrentPosition( 
            doLocationSuccess, 
            doLocationError 
        );
    } else {
        doLocationError( 'Geolocation not supported.' );
    }  	
}

// Called when a photo is clicked
// Recenter map view
// Update tabs
// Hide list and show map
// Show information window
function doItemClick()
{
	var id = null;
	var item = null;
	var list = null;
	var map = null;
	var position = null;
	var tabs = null;
	
	// Debug
	console.log( 'Item click.' );
	
	// Photo click will be mouse argument
	// Message arrived has element as argument
	if( !arguments[0].type )
	{
		item = arguments[0];		
	} else {
		item = this;	
	}
	
	// ID of selected photo
	id = item.getAttribute( 'data-id' );
	
	// Look at stored marker references
	for( var m = 0; m < google_markers.length; m++ )
	{
		// Found matching ID in markers
		if( google_markers[m].stream._id == id )
		{
			// Position
			position = new google.maps.LatLng(
				google_markers[m].stream.latitude,
				google_markers[m].stream.longitude				
			)
			
			// Center map
			google_maps.setCenter( position );
			google_maps.setZoom( 12 );
			
			
			// Photo requires view switch
			// Already in map then stay in map
			if( arguments[0].type == 'click' )
			{
				// Control selected tab
				tabs = document.querySelectorAll( '.header .tabs p' );
				tabs[0].classList.remove( 'selected' );
				tabs[1].classList.add( 'selected' );
				
				// Switch views
				list = document.querySelector( '.list' );
				map = document.querySelector( '.map' );
				
				map.style.visibility = 'visible';
				list.style.visibility = 'hidden';				
			}
			
			// Show information window
			doMarkerClick( google_markers[m] );
			
			break;		
		}
	}
}

// Problem access geolocation
// Could be the user declined access
// Could be the feature is not present
function doLocationError( error )
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
	
	// Google Maps
	// Centered on device location
	google_maps = new google.maps.Map( document.querySelector( '.map' ), {
		center: {
			lat: latitude,
			lng: longitude
		},
		zoom: MAP_ZOOM
	} );
	
	// Markers on the map
	google_markers = [];	
}

// Called when map tab is click
// Toggle view to show map
function doMapClick()
{
	var list = null;
	var map = null;
	var tabs = null;
	
	// Debug
	console.log( 'Map.' );
	
	// Already viewing this tab
	if( this.className.indexOf( 'selected' ) >= 0 )
	{
		console.log( 'Already active.' );
		return;
	}
	
	// Switch visual indicator
	tabs = document.querySelectorAll( '.header .tabs p' );
	tabs[0].classList.remove( 'selected' );
	tabs[1].classList.add( 'selected' );
	
	// Switch view
	map = document.querySelector( '.map' );
	map.style.visibility = 'visible';
	
	list = document.querySelector( '.list' );
	list.style.visibility = 'hidden';	
}

// Called when a map marker is clicked
// Display information window
function doMarkerClick()
{
	var height = null;
	var marker = null;
	var ratio = null;
	var source = null;
	var width = null;
	
	// Debug 
	console.log( 'Marker click.' );
	
	// Hide existing window
	if( info != null )
	{
		info.close();
		info = null;
	}
	
	// Click on marker directly
	// Click on photo and show marker details
	if( !arguments[0].latLng )
	{
		marker = arguments[0];		
	} else {
		marker = this;
	}
	
	// Ratio of original
	ratio = marker.stream.height / marker.stream.width;
	
	// Image width
	// Same width as used by stream list
	width = Math.round( ( window.innerWidth - ( ( LIST_COLUMNS + 1 ) * LIST_COLUMN_GAP ) ) / LIST_COLUMNS );
	
	// Image height
	// Proportionate to stream column width
	height = width * ratio;	
	
	// Image source	
	source = 
		SERVICE_ROOT + 
		configuration.bluemix.applicationId + 
		SERVICE_ATTACHMENT + 
		marker.stream._id;
	
	// Information window
	info = new google.maps.InfoWindow( {
		content: '<img src="' + source + '" width="' + width + '" height="' + height + '">'	
	} );
	info.open( google_maps, marker );
}

// Called when message arrives
// Creates new element in list
// Places new marker on map
// TODO: Deal with remove actions
function doMessage( data )
{
	var clone = null;
	var list = null;
	var match = null;
	var tab = null;	
	
	// Debug
	console.log( 'Message: ' + data._id );
	
	// Change in database
	// No attachment yet
	if( !data._attachments )
	{
		return;	
	}	

	// Check for duplicates
	match = document.querySelector( '.item[data-id=\'' + data._id + '\']' );
	
	// Do not create duplicate
	if( match != null )
	{
		return;
	}
	
	// All is well
	// Please continue
	
	// Add to data model
	stream.unshift( data );
	
	// List
	list = document.querySelector( '.list' );
	
	// New element
	clone = create( data );
	
	// Location depends on list state
	// First in list if items exist
	// Simply append to list otherwise
	if( list.children.length > 0 )
	{
		list.insertBefore( clone, list.children[0] );
	} else {
		list.appendChild( clone );
	}
	
	// Check for view
	// Map view will zoom in on marker
	tab = document.querySelector( '.header .tabs p:last-of-type' );
	
	if( tab.className.indexOf( 'selected' ) >= 0 )
	{
		doItemClick( clone );
	}
}

// Called when stream tab is click
// Toggle view to show image stream
function doStreamClick()
{
	var map = null;
	var list = null;
	var tabs = null;
	
	// Debug
	console.log( 'Stream.' );
	
	// Already viewing this tab
	if( this.className.indexOf( 'selected' ) >= 0 )
	{
		console.log( 'Already active.' );
		return;
	}
	
	// Switch visual indicator
	tabs = document.querySelectorAll( '.header .tabs p' );
	tabs[1].classList.remove( 'selected' );
	tabs[0].classList.add( 'selected' );
	
	// Switch view
	list = document.querySelector( '.list' );
	list.style.visibility = 'visible';
		
	map = document.querySelector( '.map' );
	map.style.visibility = 'hidden';
}

// Called when file selection is made
// May upload if selection was made
function doUploadChange()
{
	var form = null;
	var input = null;
	var url = null;
	
	// Debug
	console.log( 'Upload.' );
	
	// Files
	input = document.querySelector( 'input[type=file]' );	
	
	// Something selected
	if( input.value.length > 0 )
	{
		// Build the form
		form = new FormData();
		form.append( 'latitude', latitude );
		form.append( 'longitude', longitude );
		form.append( 'timestamp', Date.now() );
		form.append( 'attachment', input.files[0] );
		
		// URL of service
		// TODO: Cloud Code multipart upload?
		url = SERVICE_ROOT + configuration.bluemix.applicationId + '/' + SERVICE_PICTURE;
		
		// Upload file and data
		// Multipart file upload
		xhr = new XMLHttpRequest();
		xhr.addEventListener( 'load', doUploadLoad );
		xhr.open( 'POST', url );
		xhr.send( form );
	}
}

// Called to show file selection
function doUploadClick()
{
	// Debug
	console.log( 'File selection.' );
	
	// Emulate click
	document.querySelector( 'input[type=file]' ).click();
}

// Called when file upload is finished
function doUploadLoad()
{
	// Debug
	console.log( 'Upload done.' );
	
	xhr.removeEventListener( 'load', doUploadLoad );
	xhr = null;
}

// Called when the document has loaded
// Load configuration file
// Setup event handling
// Layout user interface 
function doWindowLoad()
{
	var tab = null;
	var upload = null;
	
	// Debug
	console.log( 'Load.' );
	
	// Load configuration
	xhr = new XMLHttpRequest();
	xhr.addEventListener( 'load', doConfigurationLoad );
	xhr.open( 'GET', PATH_CONFIGURATION );
	xhr.send( null );
	
	// Touch support
    touch = ( 'ontouchstart' in document.documentElement ) ? true : false;	
	
	// Tab event handlers
	tab = document.querySelector( '.header .tabs p:first-of-type' );
	tab.addEventListener( touch ? 'touchstart' : 'click', doStreamClick );
	
	tab = document.querySelector( '.header .tabs p:last-of-type' );
	tab.addEventListener( touch ? 'touchstart' : 'click', doMapClick );	
	
	// File upload
	upload = document.querySelector( '.upload' );
	upload.addEventListener( touch ? 'touchstart' : 'click', doUploadClick );
	
	upload = document.querySelector( 'input[type=file]' );
	upload.addEventListener( 'change', doUploadChange );
	
	// Layout user interface
	doWindowResize();
}

// Called when the window is resized
// Updates user interface as needed
function doWindowResize()
{
	var header = null;
	var list = null;
	var tabs = null;
	
	// Reference for measurments
	header = document.querySelector( '.header' );		
	
	// Size tabs to split window evenly
	tabs = document.querySelectorAll( '.header .tabs p' );
	
	for( var t = 0; t < tabs.length; t++ )
	{
		tabs[t].style.width = Math.round( window.innerWidth / tabs.length ) + 'px';
		tabs[t].style.left = Math.round( ( window.innerWidth / tabs.length ) * t ) + 'px';
	}
	
	// List
	list = document.querySelector( '.list' );
	list.style.height = Math.round( window.innerHeight - header.clientHeight ) + 'px';
	
	// Resize existing if needed
	// Useful for orientation changes
	if( list.children.length > 0 )
	{
		for( var c = 0; c < list.children.length; c++ )
		{
			list.children[c].style.width = Math.round( ( window.innerWidth - ( ( LIST_COLUMNS + 1 ) * LIST_COLUMN_GAP ) ) / LIST_COLUMNS ) + 'px';
			list.children[c].style.height = Math.round( ( window.innerWidth - ( ( LIST_COLUMNS + 1 ) * LIST_COLUMN_GAP ) ) / LIST_COLUMNS ) + 'px';				
		}
	}
	
	// Map
	map = document.querySelector( '.map' );
	map.style.height = Math.round( window.innerHeight - header.clientHeight ) + 'px';
}

// Initialize application
// Layout user interface as needed
window.addEventListener( 'load', doWindowLoad );
window.addEventListener( 'resize', doWindowResize );
