// Constants
var IOT_TOPIC = 'buildings_topic';
var KAAZING_ID = 'd71dfe3a-818e-4f9c-8af6-fb81649d9a6d';
var PARSE_APP = '_PARSE_APP_';
var PARSE_KEY = '_PARSE_JS_KEY_';
var REAL_TIME_ON = 1;
var REAL_TIME_OFF = 0;
var SVG_PATH = 'http://www.w3.org/2000/svg';

// Parse IoT object
var Iot = Parse.Object.extend( 'Iot' );

// Global
var comfort = null;
var interval = null;
var kaazing = null;
var live = null;
var realtime = false;
var usage = null;

// Called to embellish the large graph
// Does so dynamically to match screen
function drawRange()
{
  var path = null;
  
  // Outer range
  path = document.createElementNS( SVG_PATH, 'path' );
  path.setAttribute( 'd', 
    'M0 140 ' + 
    'L' + comfort.container.clientWidth + ' 30 ' + 
    'L' + comfort.container.clientWidth + ' 100 ' + 
    'L30 200 ' +
    'L0 200 Z'
  );
  path.setAttribute( 'stroke', '#ffd33f' );
  path.setAttribute( 'stroke-width', '5' );  
  path.setAttribute( 'fill', 'rgba( 255, 211, 63, 0.50 )' );
  comfort.range.appendChild( path );
  
  // Inner range
  path = document.createElementNS( SVG_PATH, 'path' );
  path.setAttribute( 'd', 
    'M0 150 ' + 
    'L' + comfort.container.clientWidth + ' 40 ' + 
    'L' + comfort.container.clientWidth + ' 90 ' + 
    'L0 200 Z'                     
  );
  path.setAttribute( 'fill', '#70c047' );
  comfort.range.appendChild( path );  
}

function drawComfort( value ) 
{
  var offset = null;
  var result = null;
  var transform = null;
  var wave = null;
    
  if( value != null )
  {
    result = scale( 
      value,
      -1,
      1,
      12,
      88
    );    

    // Label
    // Slider
    comfort.usage.innerHTML = Math.round( result ) + '%';      
    comfort.label.textContent = Math.round( result ) + '%';
    comfort.slider.setAttribute( 'width', Math.round( result ) + '%' );
    
    // Callout
    transform = scale( 
      result,
      12,
      88,
      0,
      comfort.callout.parentElement.clientWidth - 50 - 30
    );
        
    comfort.callout.setAttribute( 'transform', 
      'translate( ' + 
      Math.floor( transform ) + 
      ', 10 )' 
    );
    
    // Random horizontal placement
    // Since there is no time axis
    offset = ( ( comfort.container.clientWidth - 20 ) * Math.random() ) + 10;

    // Plot
    comfort.plot.setAttribute( 'transform', 'translate( ' + offset + ', ' + ( 100 + ( 88 * value ) ) + ' )' );
    comfort.plot.setAttribute( 'opacity', 1 );
  } else if( value == null ) {    
    result = scale( 
      comfort.history[comfort.history.length - 1].comfort,
      -1,
      1,
      12,
      88
    );
    
    // Label
    // Slider
    comfort.usage.innerHTML = Math.round( result ) + '%';      
    comfort.label.textContent = Math.round( result ) + '%';
    comfort.slider.setAttribute( 'width', Math.round( result ) + '%' );
    
    // Callout
    transform = scale( 
      result,
      12,
      88,
      0,
      comfort.callout.parentElement.clientWidth - 50 - 30
    );
    
    comfort.callout.setAttribute( 'transform', 
      'translate( ' + 
      Math.floor( transform ) + 
      ', 10 )' 
    );
    
    // Hide plot
    comfort.plot.setAttribute( 'opacity', 0 );          
    
    // Draw sine curve
    for( var h = 0; h < comfort.history.length; h++ )
    {
      if( h == 0 )
      {
        wave = 'M0 ' + ( 100 + ( 90 * comfort.history[h].comfort ) ) + ' ';
      } else {
        wave = wave + 'L' + h + ' ' + ( 100 + ( 90 * comfort.history[h].comfort ) ) + ' ';  
      }
    }
    
    comfort.chart.setAttribute( 'd', wave );
  }  
}

function drawIndex( value ) 
{
  var result = null;
  var transform = null;
    
  if( value != null )
  {
    result = scale( 
      value,
      -1,
      1,
      12,
      88
    );    

    // Label
    // Slider
    live.usage.innerHTML = parseFloat( value ).toFixed( 2 );      
    live.label.textContent = Math.round( result ) + '%';
    live.slider.setAttribute( 'width', Math.round( result ) + '%' );
    
    // Callout
    transform = scale( 
      result,
      12,
      88,
      0,
      live.callout.parentElement.clientWidth - 50 - 30
    );    

    live.callout.setAttribute( 'transform', 
      'translate( ' + 
      Math.floor( transform ) + 
      ', 0 )' 
    );
  } else if( value == null ) {    
    result = scale( 
      comfort.history[comfort.history.length - 1].index,
      -1,
      1,
      12,
      88
    );    
    
    // Label
    // Slider
    live.usage.innerHTML = parseFloat( comfort.history[comfort.history.length - 1].index ).toFixed( 2 );      
    live.label.textContent = Math.round( result ) + '%';
    live.slider.setAttribute( 'width', Math.round( result ) + '%' );
    
    // Callout
    transform = scale( 
      result,
      12,
      88,
      0,
      live.callout.parentElement.clientWidth - 50 - 30
    );

    live.callout.setAttribute( 'transform', 
      'translate( ' + 
      Math.floor( transform ) + 
      ', 0 )' 
    );
  }  
}

function drawUsage( value ) 
{
  var result = null;
  var transform = null;
    
  if( value != null )
  {
    result = scale( 
      value,
      -1,
      1,
      12,
      88
    );    

    // Label
    // Slider
    usage.usage.innerHTML = Math.round( result ) + '%';      
    usage.label.textContent = Math.round( result ) + '%';
    usage.slider.setAttribute( 'width', Math.round( result ) + '%' );
    
    // Callout
    transform = scale( 
      result,
      12,
      88,
      0,
      usage.callout.parentElement.clientWidth - 50 - 30
    );

    usage.callout.setAttribute( 'transform', 
      'translate( ' + 
      Math.floor( transform ) + 
      ', 0 )' 
    );
  } else if( value == null ) {    
    result = scale( 
      comfort.history[comfort.history.length - 1].usage,
      -1,
      1,
      12,
      88
    );        

    // Label
    // Slider
    usage.usage.innerHTML = Math.round( result ) + '%';      
    usage.label.textContent = Math.round( result ) + '%';
    usage.slider.setAttribute( 'width', Math.round( result ) + '%' );
    
    // Callout
    transform = scale( 
      result,
      12,
      88,
      0,
      usage.callout.parentElement.clientWidth - 50 - 30
    );

    usage.callout.setAttribute( 'transform', 
      'translate( ' + 
      Math.floor( transform ) + 
      ', 0 )' 
    );
  }  
}

// Called to get latest sensor values
// Uses Parse
function queryLatest()
{
  var query = null;
  
  // Query Parse
  query = new Parse.Query( Iot );
  query.descending( 'createdAt' );
  query.first( {
    success: doLatestSuccess,
    error: doLatestError
  } );
}

// Remove interval highlight
function removeSelection( button ) 
{
  button = document.querySelector( button );
  button.classList.remove( 'selected' );
}

// Linear transform for charting
// Maps a value in one range to a value in another range
function scale( value, old_top, old_bottom, new_top, new_bottom )
{
  return new_bottom + ( new_top - new_bottom ) * ( ( value - old_bottom ) / ( old_top - old_bottom ) ); 
}

// Highlight the given button
// Remove highlight from others
function setSelectedControlButton( selected )
{
  var button = null;
  
  // Remove from all
  removeSelection( '.refresh' );
  removeSelection( '.turtle' );
  removeSelection( '.funnel' );
  removeSelection( '.kaazing' );

  // Add back to specified
  button = document.querySelector( selected );
  button.classList.add( 'selected' );
}

// Called when five second button is clicked
// Clears existing interval
// Tells server not to publish data
// Gets the latest sensor values from Parse
// Updates the chart
// Repeats every five seconds
function doFiveClick()
{ 
  // Clear existing
  if( interval != null )
  {
    clearInterval( interval );
    interval = null;
  }
  
  // Stop real time
  kaazing.publish( IOT_TOPIC, JSON.stringify( {
    attention: 'server',
    value: REAL_TIME_OFF
  } ) );  
  
  // Latest value from Parse
  queryLatest();
  
  // Show plot dot on chart
  comfort.plot.setAttribute( 'opacity', 1 );
  comfort.chart.setAttribute( 'd', 'M0 0' );    
  comfort.chart.setAttribute( 'opacity', 0 );
  
  // Repeat every five seconds
  interval = setInterval( queryLatest, 5000 );

  // Highlight selected interval
  setSelectedControlButton( '.turtle' );
}

// Called when Kaazing Gateway is connected
// Subscribes for events
function doGatewayConnect() {
  console.log( 'Client connected.' );
  
  // Subscribe
  kaazing.on( Gateway.EVENT_MESSAGE, doGatewayMessage );
  kaazing.subscribe( IOT_TOPIC );  
}

// Called when a message arrives
// Parses body to JSON
// Assigns new values
// Update charts
function doGatewayMessage( message ) {
  var data = null;
  var parts = null;
  
  // Parse JSON
  data = JSON.parse( message );  
  
  // Date is now
  comfort.asof.innerHTML = 'As of Today at ' + moment().format( 'h:mm:ss A' );
    
  // Who is this message for
  // Messages can be directed to server as well
  // Looking for client messages
  if( data.attention == 'client' ) 
  {
    // Split the CSV sensor values
    parts = data.value.split( ',' );
    
    // Slide chart across screen
    // FIFO array values
    // Array size the pixel size of the chart
    if( comfort.history.length >= comfort.container.clientWidth )
    {
      comfort.history.splice( 0, 1 );  
    }
    
    // Push the latest sensor values
    comfort.history.push( {
      comfort: parseFloat( parts[0] ),
      usage: parseFloat( parts[1] ),
      index: parseFloat( parts[2] )
    } );
    
    // Draw the charts
    drawComfort( null );
    drawUsage( null );
    drawIndex( null );
  }
}

// Switch to real-time
// Stop polling
// Turn off plot dot
// Tell server to go
function doKaazingClick() 
{
  // Stop polling  
  if( interval != null )
  {
    clearInterval( interval );    
    interval = null;
  }
 
  // Hide plot dot
  // Show sine wave
  comfort.plot.setAttribute( 'opacity', 0 );  
  comfort.chart.setAttribute( 'opacity', 1 );  
  comfort.chart.setAttribute( 'd', 'M0 0' );    

  comfort.history = [];
  
  // Tell server to start real time
  kaazing.publish( IOT_TOPIC, JSON.stringify( {
    attention: 'server',
    value: REAL_TIME_ON
  } ) );

  // Highlight selected interval
  setSelectedControlButton( '.kaazing' );
}

// Switch to manual refresh
// Clear intervals
// Show plot dot
// Turn off real time
function doManualClick()
{
  // Clear interval
  if( interval != null )
  {
    clearInterval( interval );  
    interval = null;
  }
  
  // Make look old
  comfort.asof.innerHTML = 'As of the Last 30 Days';    
  
  // Hide sine wave
  // Show plot dot
  comfort.plot.setAttribute( 'opacity', 1 );
  comfort.chart.setAttribute( 'd', 'M0 0' );  
  comfort.chart.setAttribute( 'opacity', 0 );  
  
  // Turn off real time
  // Instructions to server
  kaazing.publish( IOT_TOPIC, JSON.stringify( {
    attention: 'server',
    value: REAL_TIME_OFF
  } ) );  

  // Highlight selected interval
  setSelectedControlButton( '.refresh' );
}

// Problem querying Parse
function doLatestError( error ) 
{
  console.log( 'Latest' );
  console.log( error );
}

// Latest sensor data from Parse
// Charts values
function doLatestSuccess( result ) 
{
  // Match date of data
  comfort.asof.innerHTML = 'As of Today at ' + moment().format( 'h:mm:ss A' );  
  
  // Update charts
  drawComfort( result.get( 'comfort' ) );
  drawUsage( result.get( 'usage' ) );
  drawIndex( result.get( 'index' ) );  
}

// Called for one second interval
// Clears existing intervals
// Shows plot dot
// Get latests data from Parse
// Turn off real time
function doOneClick()
{ 
  // Clear interval
  if( interval != null )
  {
    clearInterval( interval );
    interval = null;
  }
  
  // Show plot dot
  // Hide sine wave
  comfort.plot.setAttribute( 'opacity', 1 );  
  comfort.chart.setAttribute( 'd', 'M0 0' );    
  comfort.chart.setAttribute( 'opacity', 0 );  
  
  // Query latest data from Parse
  queryLatest();
  
  // Turn off real time
  // Message to server
  kaazing.publish( IOT_TOPIC, JSON.stringify( {
    attention: 'server',
    value: REAL_TIME_OFF
  } ) );  
  
  // Start polling every one second
  interval = setInterval( queryLatest, 1000 );  

  // Highlight selected interval
  setSelectedControlButton( '.funnel' );
}

// Called when document has loaded
// Manages control display
// Connect to Kaazing Gateway
// Gets references for charting
function doWindowLoad()
{
  var button = null;
  var controls = null;
  
  // Show controls
  if( URLParser( window.location.href ).hasParam( "controls" ) )
  {
    console.log( 'Controls requested.' );
    
    controls = document.querySelector( '#controls' );
    controls.style.visibility = 'visible';
  }
    
  // Modes
  // Manual refresh
  button = document.querySelector( '.refresh' );
  button.addEventListener( 'click', doManualClick );
  
  // Every five seconds
  button = document.querySelector( '.turtle' );
  button.addEventListener( 'click', doFiveClick );  
  
  // Once per second
  button = document.querySelector( '.funnel' );
  button.addEventListener( 'click', doOneClick );
  
  // Real-time with Kaazing
  button = document.querySelector( '.kaazing' );
  button.addEventListener( 'click', doKaazingClick );  

  // Highlight default interval
  setSelectedControlButton( '.refresh' );

  // Gateway
  kaazing = Gateway.connect( KAAZING_ID, doGatewayConnect );    
  
  // Charting components
  // Comfort level
  comfort = {
    asof: document.querySelector( '.as-of' ),
    callout: document.querySelector( '#comfort-callout' ),
    chart: document.querySelector( '#chart' ),
    container: document.querySelector( '#comfort' ),
    history: new Array(),
    label: document.querySelector( '#comfort-label' ),
    plot: document.querySelector( '#plot' ),
    range: document.querySelector( '#range' ),
    slider: document.querySelector( '#comfort-slider' ),
    usage: document.querySelector( '#comfort-percent' )
  };

  // Live
  live = {
    callout: document.querySelector( '#live-callout' ),
    label: document.querySelector( '#live-label' ),
    slider: document.querySelector( '#live-slider' ),
    usage: document.querySelector( '#live-usage' ),
  };  
  
  // Usage
  usage = {
    callout: document.querySelector( '#usage-callout' ),
    label: document.querySelector( '#usage-label' ),
    slider: document.querySelector( '#usage-slider' ),
    usage: document.querySelector( '#usage-usage' ),
  };
  
  // Populate range
  drawRange();
  
  // Polling
  queryLatest();
}

// Use Parse for data storage
Parse.initialize( PARSE_APP, PARSE_KEY );

// Listen for document to finish loading
window.addEventListener( 'load', doWindowLoad );
