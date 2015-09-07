// Application constants
var BLANK = '.';
var BLOCK_SIZE = 4;
var BOARD_HEIGHT = 20;  
var FREQUENCY_DOWN = 0.10;
var FREQUENCY_SIDE = 0.15;
var TETRIS_TOPIC = 'tetris';

// Application variables
var board = null;
var board_width = null;
var box_size = null;
var colors = null;
var commands = null;
var fall_frequency = null;
var falling = null;    
var last_fall_time = null;
var last_move_down = null;
var last_move_side = null;
var level = null;
var lookup = null;
var move_down = null;
var move_left = null;
var move_right = null;
var pieces = null;
var score = null;
var user = null;

// Fall rate in seconds
Date.seconds = function()
{
  return Math.floor( Date.now() / 1000 );
}  
  
// Correct modulo behavior in JavaScript
Number.prototype.mod = function( n ) {
    return ( ( this % n ) + n ) % n;
};

// Piece finished falling
// Move to logical board
function add_to_board()
{
  console.log( 'Add to board.' );
  
  // Within the context of a game piece
  for( var x = 0; x < BLOCK_SIZE; x++ )
  {
    for( var y = 0; y < BLOCK_SIZE; y++ )
    {
      // Only transfer occupied spaces
      if( falling.blocks[falling.rotation][y][x] != BLANK )
      {
        // Board block references references are stored
        // Allows for faster access during game play
        // Transfer filled block piece based on position on board
        // Filled pieces indicated by data attribute (logical)
        lookup[y + falling.y][x + falling.x].setAttribute( 'data-fill', falling.color );          
      }
    }
  }
}

// Build the game board
// Uses DOM elements over canvas
// Size of blocks based on viewport
function build_board()
{
  var box = null;
  var row = null;
  
  console.log( 'Build board.' );
  
  // Box size
  box_size = Math.floor( window.innerHeight / BOARD_HEIGHT );

  // Board width in boxes
  board_width = Math.floor( window.innerWidth / box_size );
  
  // Size and position physical board
  board = document.querySelector( '.board' );
  board.style.height = ( box_size * BOARD_HEIGHT ) + 'px';
  board.style.width = ( board_width * box_size ) + 'px';
  board.style.left = Math.floor( ( window.innerWidth - board.clientWidth ) / 2 ) + 'px';

  // Blocks in board
  // Keep reference for fast lookup
  lookup = [];
  
  for( var y = 0; y < BOARD_HEIGHT; y++ )
  {
    row = [];
    
    for( var x = 0; x < board_width; x++ )
    {
      // Create element
      box = document.createElement( 'div' );
      
      // Sizing and placement
      box.style.width = box_size + 'px';
      box.style.height = box_size + 'px';
      box.style.position = 'absolute';
      box.style.left = ( x * box_size ) + 'px';
      box.style.top = ( y * box_size ) + 'px';      
      
      // Logical board
      box.setAttribute( 'data-fill', BLANK );
      
      // Add to DOM
      board.appendChild( box );
      
      // Add to logical row
      row.push( box );
    }
    
    // Add row to board
    lookup.push( row );
  }
}
  
// Colors array
// References to styles
// Change appearance by changing stylesheet
// Then change class name references here
function build_colors()
{
  console.log( 'Build colors.' );
  
  colors = [];
  
  // Class name references
  colors.push( 'joe' );
  colors.push( 'shen' );  
  colors.push( 'shaunak' );  
  colors.push( 'jon' );  
  colors.push( 'kevin' );    
}
  
// Build array of pieces
// Shapes and rotations defined in separate file
function build_pieces()
{
  console.log( 'Build pieces.' );
  
  pieces = [];
  
  // Block shapes and rotations
  pieces.push( SHAPE_I );
  pieces.push( SHAPE_J );
  pieces.push( SHAPE_L );
  pieces.push( SHAPE_O );
  pieces.push( SHAPE_S );
  pieces.push( SHAPE_T );
  pieces.push( SHAPE_Z );
}
  
// Rate of fall
// Can be tuned
function calculate_fall_frequency( level )
{
  console.log( 'Calculate fall frequency.' );
  
  return 0.27 - ( level * 0.02 );
}
  
// Level based on score
// Can be tuned
function calculate_level( score ) 
{
  console.log( 'Calculate level.' );
    
  return Math.round( score / 10 ) + 1;
}    
  
// Draw the board based
// Happens with every fall
// Pulls style from logical representation
// Logical representation kept as data attribute
function draw_board()
{
  console.log( 'Draw board.' );
  
  // Iterate through the board
  for( var y = 0; y < BOARD_HEIGHT; y++ )
  {
    for( var x = 0; x < board_width; x++ )
    {
      // Clear cells where needed
      // Add class name for styling if filled
      if( lookup[y][x].getAttribute( 'data-fill' ) == BLANK ) 
      {
        lookup[y][x].className = 'none';  
      } else {
        lookup[y][x].className = lookup[y][x].getAttribute( 'data-fill' );          
      }
    }
  }
}
  
// Draw the piece as it falls
// Happens with every fall step
// Applied to styles on board cells
// Does not impact logical board (attribute)
function draw_piece()
{
  console.log( 'Draw piece.' );
  
  for( var y = 0; y < BLOCK_SIZE; y++ )
  {
    for( var x = 0; x < BLOCK_SIZE; x++ )
    {
      // Not blank
      if( falling.blocks[falling.rotation][y][x] != BLANK )
      {
        // Set style
        lookup[falling.y + y][falling.x + x].className = falling.color;
      }
    }
  }
}
  
// Generate a new piece to start falling
// Picks from available pieces
// Random rotation from piece template
// Random color
// Position in center of board at the top
function get_new_piece()
{
  var piece = null;
  var rotation = null;
  
  console.log( 'Get new piece.' );
  
  // Piece and rotation
  piece = Math.floor( Math.random() * pieces.length );
  rotation = Math.floor( Math.random() * pieces[piece].length );
  
  // Return reference
  return {
    blocks: pieces[piece],
    color: colors[Math.floor( Math.random() * colors.length )],    
    rotation: rotation,
    x: Math.floor( ( board_width - BLOCK_SIZE ) / 2 ),
    y: 0
  };
}
  
// Check for completed line on specific row
function is_complete_line( y )
{
  for( var x = 0; x < board_width; x++ )
  {
    // Completed lines have no blank cells
    if( lookup[y][x].getAttribute( 'data-fill' ) == BLANK )
    {
      return false;  
    }
  }
  
  return true;   
}
  
// See if the provided cell is on the board
// Keeps blocks from being positioned outside of board
// Can pass values to check for future moves
function is_on_board( x, y )
{
  return x >= 0 && x < board_width && y < BOARD_HEIGHT;
}
  
// Check next step for piece
// Used to make sure placement is valid
// Different from board
// Accounts for blocks placed on logical board
function is_valid_position( adjust_x, adjust_y )
{
  var is_above_board = null;
  
  // Within context of block
  for( var x = 0; x < BLOCK_SIZE; x++ )
  {
    for( var y = 0; y < BLOCK_SIZE; y++ )
    {
      // Above the board
      // Common for new piece placement
      is_above_board = y + falling.y + adjust_y < 0;
      
      // Blank is okay to fall
      if( is_above_board || falling.blocks[falling.rotation][y][x] == BLANK )
      {
        continue;
      }
      
      // Not on board is not valid movment
      if( !is_on_board( x + falling.x + adjust_x, y + falling.y + adjust_y ) )
      {
        return false;   
      }
         
      // No other block in the way
      if( lookup[y + falling.y + adjust_y][x + falling.x + adjust_x].getAttribute( 'data-fill' ) != BLANK )
      {
        return false;      
      }
    }
  }
  
  return true;
}
  
// Remove a completed line from the logical board
function remove_completed_lines()
{
  var lines_removed = null;
  var pull_y = null;
  var y = null;
  
  // How many lines removed
  // From what row on the board
  // Start at bottom of board
  lines_removed = 0;
  y = BOARD_HEIGHT - 1;  
  
  // Move up through the rows
  while( y >= 0 )
  {
    // Completed line
    if( is_complete_line( y ) )
    {
      // Shift pieces down if something above
      for( var pull_y = y; pull_y > 0; pull_y-- )
      {
        for( var x = 0; x < board_width; x++ )
        {
          lookup[pull_y][x].setAttribute( 'data-fill', lookup[pull_y - 1][x].getAttribute( 'data-fill' ) );  
        }
      }
      
      // Clear logical board if nothing present
      for( x = 0; x < board_width; x++ )
      {
        lookup[0][x].setAttribute( 'data-fill', BLANK );  
      }      
      
      // Increment lines removed
      // Impacts speed of falling
      lines_removed = lines_removed + 1;
    } else {
      // Nope
      // Move on up the board
      y = y - 1;
    }
  }
  
  return lines_removed;
}
  
// Animation
function tick()
{
  // Nothing is falling
  if( falling == null )
  {
    // Get a new piece
    // Update clock for next fall
    falling = get_new_piece();
    last_fall_time = Date.seconds();
    
    // Nothing falling
    // Cannot place new piece at top
    // Game over
    if( !is_valid_position( 0, 0 ) )
    {
      console.log( 'Game over.' );
      return;
    }
  }
  
  // Ready to fall
  if( Date.seconds() - last_fall_time > fall_frequency )
  {
    // Can the piece fall
    if( !is_valid_position( 0, 1 ) )
    {
      // Cannot fall
      // Add to logical board
      add_to_board();
    
      // Increment game statistics
      score = score + remove_completed_lines();  
      level = calculate_level( score );
      fall_frequency = calculate_fall_frequency( score );
      
      // No piece is falling
      falling = null;
    } else {
      // Can fall
      // Increment position
      // Set clock for next fall
      falling.y = falling.y + 1;
      last_fall_time = Date.seconds();      
    }
  }
  
  // Draw board
  // Considers placed pieces
  draw_board();
  
  // Something is falling
  // Draw it on the board
  if( falling != null )
  {
    draw_piece();  
  }
  
  // Keep going
  requestAnimationFrame( tick );
}
  
// Connected to Kaazing Gateway
function do_connect()
{
  console.log( 'Connected.' );
  
  // Listen for controller messages
  // User is unique to keep games unique
  user = TETRIS_TOPIC + '_' + user;
  socket.addEventListener( 'message', do_message );    
}
  
// Controller message arrived
function do_message( message )
{
  var data = null;
  var qrcode = null;
  
  console.log( message );
    
  // Parse string to data object
  data = JSON.parse( message.data );

  // Ignore messages not for this user
  if( data.user != user )
  {
    return;
  }
    
  // Game not yet being played
  // Controller wants to join
  if( data.action == 'tetris_join' ) {
    
    // Hide QRCode
    qrcode = document.querySelector( '#qrcode' );
    qrcode.style.visibility = 'hidden';
    qrcode.style.display = 'none';
    
    // Start game
    requestAnimationFrame( tick );
  } else if( data.action == 'tetris_up' ) {
    // Controller button released
    // Clear flags
    if( data.key == 'left' ) 
    {
      move_left = false;  
    } else if( data.key == 'right' ) {
      move_right = false;  
    } else if( data.key == 'down' ) {
      move_down = false;  
    }
  } else if( data.action == 'tetris_down' ) {
    // Controller button pressed
    // Update piece position
    // Set movement flags
    // Reset clock for next movement
    if( data.key == 'left' && is_valid_position( -1, 0 ) )
    {
      falling.x = falling.x - 1;
      move_left = true;
      move_right = false;
      last_move_side = Date.seconds();
    } else if( data.key == 'right' && is_valid_position( 1, 0 ) ) {
      falling.x = falling.x + 1;
      move_right = true;
      move_left = false;
      last_move_side = Date.seconds();
    } else if( data.key == 'down' ) {
      move_down = true;
      
      // Make sure placement will be valid
      if( is_valid_position( 0, 1 ) )
      {
        falling.y = falling.y + 1;
      }
      
      // Update movement clock
      last_move_down = Date.seconds();
    } else if( data.key == 'clock' ) {
      falling.rotation = ( falling.rotation + 1 ).mod( 4 );
      
      // Make sure placement will be valid
      if( !is_valid_position( 0, 0 ) ) 
      {
        falling.rotation = ( falling.rotation - 1 ).mod( 4 );        
      }
    } else if( data.key == 'counter' ) {
      console.log( ( falling.rotation - 1 ) % 4 );
      
      // Apply new rotation
      falling.rotation = ( falling.rotation - 1 ).mod( 4 );
      
      // If not valid location
      // Reset rotation to previous
      if( !is_valid_position( 0, 0 ) ) 
      {
        falling.rotation = ( falling.rotation + 1 ).mod( 4 );        
      }
    } else if( data.key == 'up' ) {
      move_down = false;
      move_left = false;
      move_right = false;
      
      for( var i = 0; i < BOARD_HEIGHT; i++ )
      {
        if( !is_valid_position( 0, i ) )
        {
          break;  
        }
      }
      
      falling.y = falling.y + ( i - 1 );
    }
  }
  
  // Flags set for horizontal movement
  if( ( move_left || move_right ) && ( Date.seconds() - last_move_side ) > FREQUENCY_SIDE )
  {
    if( move_left && is_valid_position( -1, 0 ) )
    {
      falling.x = falling.x - 1;  
    } else if( move_right && is_valid_position( 1, 0 ) ) {
      falling.x = falling.x + 1;
    }
    
    last_move_side = Date.seconds();
  }  
  
  // Flags set for vertical movement (down)
  if( move_down && ( ( Date.seconds() - last_move_down ) > FREQUENCY_DOWN ) && is_valid_position( 0, 1 ) )
  {
    falling.y = falling.y + 1;
    last_move_down = Date.seconds();
  }
}
  
// Called when window is loaded
// Configures game parameters
function do_window_load()
{
  var qrcode = null;
  
  console.log( 'Load.' );
  
  // Build necessary parts
  build_colors();
  build_pieces();
  build_board();  
  
  // Track times for movement
  last_move_down = Date.seconds();
  last_move_side = Date.seconds();
  last_fall_time = Date.seconds();
  
  // Incoming commands from controller
  commands = [];
  
  // Game statistics
  score = 0;
  level = calculate_level( score );
  fall_frequency = calculate_fall_frequency( level );
  
  // New falling piece
  falling = get_new_piece();
  
  // Connect to WebSocket server
  socket = new WebSocket( 'ws://' + window.location.host );
  socket.addEventListener( 'open', do_connect );
  
  // Unique user
  user = Math.round( Date.now() / 1000 );
  console.log( 'User: ' + user );
  
  // Position and show QRCode element
  qrcode = document.querySelector( '#qrcode' );
  qrcode.style.top = Math.round( ( window.innerHeight - qrcode.clientHeight ) / 2 ) + 'px';
  qrcode.style.left = Math.round( ( window.innerWidth - qrcode.clientWidth ) / 2 ) + 'px';  
  qrcode.style.visibility = 'visible';
  
  // Populate QRCode element with actual QRCode
  // Client side library used
  // No server needed
  qrcode = new QRCode( 'qrcode', {
    text: 'http://sockets.mybluemix.net/tetris/controller.html?user=' + user,
    width: 300,
    height: 300,
    correctLevel: QRCode.CorrectLevel.M
  } );
}
  
// Kick things off
window.addEventListener( 'load', do_window_load );  
