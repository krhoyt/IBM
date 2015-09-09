// Constants
var SVG_PATH = 'http://www.w3.org/2000/svg';

// Global
var comfort = null;
var interval = null;
var live = null;
var kaazing = false;
var usage = null;

// Data
var latest = null;

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

// Forwards latest emulated value
// Emulation happens in separate interval
// Changes degrees to radians
function queryLatest()
{
  var emulation = null;
  
  emulation = {
    createdAt: latest.createdAt,
    comfort: Math.sin( latest.comfort * ( Math.PI / 180 ) ),
    index: Math.sin( latest.index * ( Math.PI / 180 ) ),
    usage: Math.sin( latest.usage * ( Math.PI / 180 ) )   
  };
  
  if( kaazing )
  {
    doGatewayMessage( emulation );  
  } else {
    doLatestSuccess( emulation );    
  }
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

// Emulate live sensor data
// Increment sine wave form
function doEmulation()
{
  latest.createdAt = new Date();
  latest.index = latest.index + 1;
  latest.comfort = latest.comfort + 1;
  latest.usage = latest.usage + 1;
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
  
  // Latest value from Parse
  queryLatest();
  
  // Show plot dot on chart
  comfort.plot.setAttribute( 'opacity', 1 );
  comfort.chart.setAttribute( 'd', 'M0 0' );    
  comfort.chart.setAttribute( 'opacity', 0 );
  
  kaazing = false;
  
  // Repeat every five seconds
  interval = setInterval( queryLatest, 5000 );
  
  // Highlight selected interval
  setSelectedControlButton( '.turtle' );  
}

// Called when a message arrives
// Parses body to JSON
// Assigns new values
// Update charts
function doGatewayMessage( message ) {
  // Date is now
  comfort.asof.innerHTML = 'As of Today at ' + moment().format( 'h:mm:ss A' );
    
  // Slide chart across screen
  // FIFO array values
  // Array size the pixel size of the chart
  if( comfort.history.length >= comfort.container.clientWidth )
  {
    comfort.history.splice( 0, 1 );  
  }

  // Push the latest sensor values
  comfort.history.push( {
    comfort: message.comfort,
    usage: message.usage,
    index: message.index
  } );

  // Draw the charts
  drawComfort( null );
  drawUsage( null );
  drawIndex( null );
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
  
  kaazing = true;
  
  // Start polling every one second
  interval = setInterval( queryLatest, 40 );    
  
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
  
  kaazing = false;
  
  // Highlight selected interval
  setSelectedControlButton( '.refresh' );  
}

// Latest emulation data
// Charts values
function doLatestSuccess( result ) 
{
  drawComfort( result.comfort );
  drawUsage( result.usage );
  drawIndex( result.index );        
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
  
  kaazing = false;
  
  // Query latest data from Parse
  queryLatest();
  
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
  
  // Force show of controls
  controls = document.querySelector( '#controls' );
  controls.style.visibility = 'visible';  
  
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
  
  // Emulated sensor data
  latest = {
    createdAt: new Date(),
    comfort: Math.round( Math.random() * 360 ),
    index: Math.round( Math.random() * 360 ),
    usage: Math.round( Math.random() * 360 ),
    interval: setInterval( doEmulation, 25 )
  };
  
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
    usage: document.querySelector( '#live-usage' )
  };  
  
  // Usage
  usage = {
    callout: document.querySelector( '#usage-callout' ),
    label: document.querySelector( '#usage-label' ),
    slider: document.querySelector( '#usage-slider' ),
    usage: document.querySelector( '#usage-usage' )
  };
  
  // Populate range
  drawRange();
  
  // Polling
  queryLatest();
}

// Listen for document to finish loading
window.addEventListener( 'load', doWindowLoad );
