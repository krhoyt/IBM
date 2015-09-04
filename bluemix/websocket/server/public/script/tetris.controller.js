// Message topic
var TETRIS_TOPIC = 'tetris';

// WebSocket communication
// Touch support
// Unique user for linking
var socket = null;  
var touch = null;
var user = null;

// Send a command to the game
// Publish to server
function send_command( command )
{
  socket.send( JSON.stringify( command ) );
}

// Clockwise button down
function do_clock_down()
{
  console.log( 'Clockwise down.' );  
  
  send_command( {
    action: 'tetris_down',
    key: 'clock',
    user: TETRIS_TOPIC + '_' + user
  } );
}

// Clockwise button up
function do_clock_up()
{
  console.log( 'Clockwise up.' );  
  
  send_command( {
    action: 'tetris_up',
    key: 'clock',
    user: TETRIS_TOPIC + '_' + user
  } );
}      
  
// Counter-clockwise button down
function do_counter_down()
{
  console.log( 'Counter-clockwise down.' );  
  
  send_command( {
    action: 'tetris_down',
    key: 'counter',
    user: TETRIS_TOPIC + '_' + user
  } );
}
  
// Counter-clockwise button up
function do_counter_up()
{
  console.log( 'Counter-clockwise up.' );  
  
  send_command( {
    action: 'tetris_up',
    key: 'counter',
    user: TETRIS_TOPIC + '_' + user
  } );
}        
  
// Directional pad down pressed
function do_down_down()
{
  console.log( 'Down down.' );  
  
  send_command( {
    action: 'tetris_down',
    key: 'down',
    user: TETRIS_TOPIC + '_' + user
  } );
}
  
// Directional pad down released
function do_down_up()
{
  console.log( 'Down up.' );  
  
  send_command( {
    action: 'tetris_up',
    key: 'down',
    user: TETRIS_TOPIC + '_' + user
  } );
}    
  
// Directional pad left pressed
function do_left_down()
{
  console.log( 'Left down.' );  
  
  send_command( {
    action: 'tetris_down',
    key: 'left',
    user: TETRIS_TOPIC + '_' + user
  } );
}
  
// Directional pad left released
function do_left_up()
{
  console.log( 'Left up.' );  
  
  send_command( {
    action: 'tetris_up',
    key: 'left',
    user: TETRIS_TOPIC + '_' + user
  } );
}  
  
// Directional pad right pressed
function do_right_down()
{
  console.log( 'Right down.' );  
  
  send_command( {
    action: 'tetris_down',
    key: 'right',
    user: TETRIS_TOPIC + '_' + user
  } );
}
  
// Directional pad right released
function do_right_up()
{
  console.log( 'Right up.' );  
  
  send_command( {
    action: 'tetris_up',
    key: 'right',
    user: TETRIS_TOPIC + '_' + user
  } );
}    
  
// Directional pad up pressed
function do_up_down()
{
  console.log( 'Up down.' );  
  
  send_command( {
    action: 'tetris_down',
    key: 'up',
    user: TETRIS_TOPIC + '_' + user
  } );
}
  
// Directional pad up released
function do_up_up()
{
  console.log( 'Up up.' );  
  
  send_command( {
    action: 'tetris_up',
    key: 'up',
    user: TETRIS_TOPIC + '_' + user
  } );
}      
    
// Window loaded
// Setup controller
function do_window_load()
{
  var buttons = null;
  var pad = null;
  
  // Touch support
  touch = ( 'ontouchstart' in document.documentElement ) ? true : false;  
  
  // Unique user topic
  user = URLParser( window.location.href ).getParam( 'user' );
  console.log( 'User: ' + user );
  
  // WebSocket communication
  socket = new WebSocket( 'ws://' + window.location.host );
  socket.addEventListener( 'open', function() {
    console.log( 'Connected.' );

    // Join game
    send_command( {
        action: 'tetris_join',
        user: TETRIS_TOPIC + '_' + user
    } );
  } );
  
  // Direction pad
  pad = document.querySelector( '.pad' );
  pad.children[0].addEventListener( touch ? 'touchstart' : 'mousedown', do_up_down );
  pad.children[0].addEventListener( touch ? 'touchend' : 'mouseup', do_up_up ); 
  pad.children[1].addEventListener( touch ? 'touchstart' : 'mousedown', do_left_down );
  pad.children[1].addEventListener( touch ? 'touchend' : 'mouseup', do_left_up ); 
  pad.children[2].addEventListener( touch ? 'touchstart' : 'mousedown', do_down_down );
  pad.children[2].addEventListener( touch ? 'touchend' : 'mouseup', do_down_up ); 
  pad.children[3].addEventListener( touch ? 'touchstart' : 'mousedown', do_right_down );
  pad.children[3].addEventListener( touch ? 'touchend' : 'mouseup', do_right_up );    
  
  // Rotation buttons
  buttons = document.querySelectorAll( '.button' );
  buttons[0].addEventListener( touch ? 'touchstart' : 'mousedown', do_clock_down );
  buttons[0].addEventListener( touch ? 'touchend' : 'mouseup', do_clock_up );      
  buttons[1].addEventListener( touch ? 'touchstart' : 'mousedown', do_counter_down );
  buttons[1].addEventListener( touch ? 'touchend' : 'mouseup', do_counter_up );        
  
  // Layout
  do_window_resize();
}
  
// Layout controller interface
function do_window_resize()
{  
  var buttons = null;
  var controller = null;
  var instructions = null;
  var pad = null;
  var surface = null;

  // Going to reference these two regardless of orientation
  controller = document.querySelector( '.controller' );  
  instructions = document.querySelector( '.instructions' );    
  
  if( window.innerWidth > window.innerHeight )
  {
    // Hide instructions
    instructions.style.visibility = 'hidden';
    
    // Controller
    controller.style.width = window.innerWidth + 'px';
    controller.style.height = ( window.innerWidth * 0.40 ) + 'px';    
    controller.style.top = Math.round( ( window.innerHeight - controller.clientHeight ) / 2 ) + 'px';
    controller.style.visibility = 'visible';
    
    // Decorative control area
    surface = document.querySelector( '.surface' );
    surface.style.left = Math.round( ( window.innerWidth - surface.clientWidth ) / 2 ) + 'px';
    surface.style.top = Math.round( ( controller.clientHeight - surface.clientHeight ) / 2 ) + 'px';
    
    // Direction pad
    pad = document.querySelector( '.pad' );
    pad.style.width = pad.clientHeight + 'px';
    pad.style.left = Math.round( window.innerWidth * 0.05 ) + 'px';
    pad.style.top = Math.round( ( controller.clientHeight - pad.clientHeight ) / 2 ) + 'px';    
    
    // Up
    pad.children[0].style.width = Math.round( pad.clientWidth * 0.38 ) + 'px';
    pad.children[0].style.height = Math.round( pad.clientWidth * 0.30 ) + 'px';
    pad.children[0].style.left = Math.round( pad.clientWidth * 0.30 ) + 'px';    
    
    // Left
    pad.children[1].style.width = Math.round( pad.clientWidth * 0.30 ) + 'px';
    pad.children[1].style.height = Math.round( pad.clientWidth * 0.38 ) + 'px';
    pad.children[1].style.top = Math.round( pad.clientWidth * 0.30 ) + 'px';  

    // Down
    pad.children[2].style.width = Math.round( pad.clientWidth * 0.38 ) + 'px';
    pad.children[2].style.height = Math.round( pad.clientWidth * 0.30 ) + 'px';
    pad.children[2].style.left = Math.round( pad.clientWidth * 0.30 ) + 'px';  
    pad.children[2].style.bottom = 0;    

    // Right
    pad.children[3].style.width = Math.round( pad.clientWidth * 0.30 ) + 'px';
    pad.children[3].style.height = Math.round( pad.clientWidth * 0.38 ) + 'px';
    pad.children[3].style.top = Math.round( pad.clientWidth * 0.30 ) + 'px';  
    pad.children[3].style.right = 0;          
    
    // Rotation buttons
    buttons = document.querySelectorAll( '.button' );

    for( var b = 0; b < buttons.length; b++ )
    {
      buttons[b].style.height = Math.round( window.innerHeight * 0.35 ) + 'px';
      buttons[b].style.width = Math.round( window.innerHeight * 0.35 ) + 'px';   
      buttons[b].style.bottom = Math.round( window.innerHeight * 0.20 ) + 'px';
      buttons[b].style.right = ( Math.round( window.innerWidth * 0.10 ) + ( b * ( buttons[b].clientWidth + ( window.innerWidth * 0.05 ) ) ) ) + 'px';

      buttons[b].children[0].style.width = Math.round( buttons[b].clientWidth * 0.75 ) + 'px';
      buttons[b].children[0].style.height = Math.round( buttons[b].clientWidth * 0.75 ) + 'px';
      buttons[b].children[0].style.marginTop = Math.round( ( buttons[b].clientHeight - buttons[b].children[0].clientHeight ) / 2 ) + 'px';
      buttons[b].children[0].style.borderRadius = buttons[b].children[0].clientWidth + 'px';
    }        
  } else {
    // Hide controller
    controller.style.visibility = 'hidden';
    
    // Position instructions to use in landscape mode
    instructions.style.width = Math.round( window.innerWidth * 0.80 ) + 'px';
    instructions.style.left = Math.round( ( window.innerWidth - instructions.clientWidth ) / 2 ) + 'px';
    instructions.style.top = Math.round( ( window.innerHeight - instructions.clientHeight ) / 2 ) + 'px';    
    instructions.style.visibility = 'visible';
  }
}
 
// Get this party started
window.addEventListener( 'load', do_window_load );  
window.addEventListener( 'resize', do_window_resize );    
