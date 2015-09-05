// Constant
var CLIENT_PREFIX = 'tictactoe_';
var BOX_INSET_LANDSCAPE = 100;
var BOX_INSET_PORTRAIT = 20;
var BOX_TOP_PORTRAIT = 10;
var COLUMN_COUNT = 3;
var LINE_COUNT = 8;
var SOCKET_PROTOCOL = 'ws://';
var SQUARE_INSET = 20;    
var TOPIC = 'tictactoe';    

// Application
var canvas = null;
var client = null;
var context = null;
var selected = null;
var socket = null;    
var touch = null;

// Shout out to @robtarr for gradient approach
// http://seesparkbox.com/foundry/how_i_built_a_canvas_color_picker
// Builds gradient color picker on canvas element
function picker()
{
    var gradient = null;

    gradient = context.createLinearGradient( 0, 0, canvas.width, 0 );

    // Create color gradient
    gradient.addColorStop( 0,    "rgb(255,   0,   0)" );
    gradient.addColorStop( 0.15, "rgb(255,   0, 255)" );
    gradient.addColorStop( 0.33, "rgb(0,     0, 255)" );
    gradient.addColorStop( 0.49, "rgb(0,   255, 255)" );
    gradient.addColorStop( 0.67, "rgb(0,   255,   0)" );
    gradient.addColorStop( 0.84, "rgb(255, 255,   0)" );
    gradient.addColorStop( 1,    "rgb(255,   0,   0)" );

    // Apply gradient to canvas
    context.fillStyle = gradient;
    context.fillRect( 0, 0, canvas.width, canvas.height );

    // Create semi transparent gradient (white -> trans. -> black)
    gradient = context.createLinearGradient( 0, 0, 0, canvas.height );
    gradient.addColorStop( 0,   "rgba(255, 255, 255, 1)" );
    gradient.addColorStop( 0.5, "rgba(255, 255, 255, 0)" );
    gradient.addColorStop( 0.5, "rgba(0,     0,   0, 0)" );
    gradient.addColorStop( 1,   "rgba(0,     0,   0, 1)" );

    context.fillStyle = gradient;
    context.fillRect( 0, 0, canvas.width, canvas.height );
}

// Called when a color is selected from the picker
// Sets color on selected square
// Sends color selection to broker for distribution
function doCanvasDown( event )
{
    var blue = null;
    var data = null;
    var green = null;
    var led = null;
    var message = null;
    var offsets = null;
    var offsetX = null;
    var offsetY = null;
    var pixel = null;
    var red = null;    

    // Handle both mouse and touch interactions
    if( touch )
    {
        // Prevent selection
        event.preventDefault();

        // Touch event does not have offset properties
        // Fake by removing location of selected element
        offsets = selected.getBoundingClientRect();
        offsetX = event.touches[0].pageX - offsets.left;
        offsetY = event.touches[0].pageY - offsets.top;
    } else {
        offsetX = event.offsetX;
        offsetY = event.offsetY;
    }

    // Physical pixel in box
    led = selected.getAttribute( "data-index");

    // Color values for pixel indicated by user interaction
    pixel = context.getImageData( offsetX, offsetY, 1, 1 );

    red = pixel.data[0];
    green = pixel.data[1];
    blue = pixel.data[2];

    // Change selected square color in user interface
    selected.style.backgroundColor = "rgb(" + red + ", " + green + ", " + blue + ")";
    selected = null;

    // Hide color picker
    canvas.style.display = "none";

    // Data object to send to device
    // Modified at server for device
    // WebSocket clients get object as-is
    data = {
        client: client,
        topic: TOPIC,
        led: led,
        red: red,
        green: green,
        blue: blue
    }
    
    // Send changes
    socket.send( JSON.stringify( data ) );
}

// Called when connected to server
function doSocketOpen()
{
    // Debug
    console.log( 'Socket open.' );
}

// Called when a message has arrived
// Changes color of box in user interface
function doSocketMessage( event )
{
    var data = null;
    var square = null;

    // Debug
    console.log( event.data );

    // Parse data
    // Display
    data = JSON.parse( event.data );    
    
    // Select square based on physical index
    // Set background color based on incoming data
    square = document.querySelector( ".square[data-index='" + data.led + "']" );
    square.style.backgroundColor = "rgb(" + data.red + ", " + data.green + ", " + data.blue + ")";
}

// Called when an inner square is selected
// Displays the color picker
function doSquareDown( event )
{
    var offsets = null;

    // Store selected square for reference
    selected = event.target;

    // Get location on page
    offsets = selected.getBoundingClientRect();

    // Position color picker at that location
    canvas.style.left = ( offsets.left + 1 ) + "px";
    canvas.style.top = ( offsets.top + 1 ) + "px";
    canvas.style.display = "inline";
}
    
// Called when page loads
// Configures main event listeners
// Connects to server
function doWindowLoad()
{
    var squares = null;

    // Unique identifier
    client = guid();
    client = client.replace( new RegExp( '-', 'g' ), '' );
    client = CLIENT_PREFIX + client;
    
    // Handle mouse or touch interaction
    touch = ( "ontouchstart" in document.documentElement ) ? true : false;

    // Get reference to canvas color picker
    // Handle event for color selection
    canvas = document.querySelector( ".picker" );
    canvas.addEventListener( touch ? "touchstart" : "mousedown", doCanvasDown );
    context = canvas.getContext( "2d" );

    // Put event listeners on inner squares
    squares = document.querySelectorAll( ".square" );

    for( var s = 0; s < squares.length; s++ )
    {
        squares[s].addEventListener( touch ? "touchstart" : "mousedown", doSquareDown );
    }

    // WebSocket
    socket = new WebSocket( SOCKET_PROTOCOL + window.location.host );
    socket.addEventListener( 'open', doSocketOpen );
    socket.addEventListener( 'message', doSocketMessage );        

    // Initial layout
    doWindowResize();
}

// Called when window resizes
// Adjust sizing to fit display
function doWindowResize()
{
    var enclosure = null;
    var inset = null;
    var logo = null;
    var squares = null;
    var minimum = null;
    var top = null;

    // Logo placement
    // Placed from top due to iOS7 treatment of position bottom
    // Show once layout is complete
    logo = document.querySelector( ".logo" );
    logo.style.top = ( window.innerHeight - logo.clientHeight - 10 ) + "px";
    logo.style.visibility = "visible";

    // Enclosure
    enclosure = document.querySelector( ".enclosure" );

    // Adaptive layout
    // Addresses width sizing
    if( window.innerWidth < window.innerHeight )
    {
        minimum = window.innerWidth;
        inset = BOX_INSET_PORTRAIT;
    } else {
        minimum = window.innerHeight;
        inset = BOX_INSET_LANDSCAPE;
    }

    enclosure.style.height = ( minimum - inset ) + "px";
    enclosure.style.width = ( minimum - inset ) + "px";
    enclosure.style.left = ( ( window.innerWidth - enclosure.clientWidth ) / 2 ) + "px";

    // Adaptive top placement
    if( window.innerWidth < window.innerHeight )
    {
        top = BOX_TOP_PORTRAIT;
    } else {
        top = Math.round( ( window.innerHeight - enclosure.clientHeight ) / 2 );
    }

    enclosure.style.top = top + "px";

    // Show enclosure once initial layout is complete
    enclosure.style.visibility = "visible";

    // Inside squares
    squares = document.querySelectorAll( ".square" );

    for( var s = 0; s < squares.length; s++ )
    {
        squares[s].style.width = Math.floor( (enclosure.clientWidth - ( SQUARE_INSET * 4 ) - LINE_COUNT ) / COLUMN_COUNT ) + "px";
        squares[s].style.height = Math.floor( (enclosure.clientWidth - ( SQUARE_INSET * 4 ) - LINE_COUNT ) / COLUMN_COUNT ) + "px";
    }

    // Color picker
    canvas.width = Math.floor( ( enclosure.clientWidth - ( SQUARE_INSET * 4 ) - LINE_COUNT ) / COLUMN_COUNT );
    canvas.height = Math.floor( ( enclosure.clientWidth - ( SQUARE_INSET * 4 ) - LINE_COUNT ) / COLUMN_COUNT );

    // Rebuild gradient on picker
    picker();
}

// Listen for page to load
// Window resize to adjust fit
window.addEventListener( "load", doWindowLoad );
window.addEventListener( "resize", doWindowResize );
