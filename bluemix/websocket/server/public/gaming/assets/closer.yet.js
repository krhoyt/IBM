var BLANK = '.';
var FPS = 24;
var TEMPLATE_HEIGHT = 5;
var TEMPLATE_WIDTH = 5;
var VERTICAL_BOXES = 20;  
  
var board = null;
var board_height = null;
var board_width = null;
var box_size = null;  
var clock = null;
var colors = null;
var fall_frequency = null;
var last_down_time = null;
var level = null;
var lookup = null;
var pieces = null;
var piece_falling = null;
var piece_next = null;
var score = null;
  
// Fall rate in seconds
Date.seconds = function()
{
  return Math.floor( Date.now() / 1000 );
}

// Add to logical board
// Piece landed and placed
function add_to_board( board, piece )
{
  for( var y = 0; y < TEMPLATE_HEIGHT; y++ )
  {
    for( var x = 0; x < TEMPLATE_WIDTH; x++ )
    {
      if( piece.shape[piece.rotation][y][x] != BLANK )
      {
        board[y + piece.y][x + piece.x] == piece.color;
      }
    }
  }
}

// Rate of fall
// Can be tuned
function calculate_fall_frequency( level )
{
  var result = null;
  
  result = 0.27 - ( level * 0.02 );
  
  return result;
}
  
// Level based on score
// Can be tuned
function calculate_level( score ) 
{
  var result = null;
  
  result = Math.round( score / 10 ) + 1;
  
  return result;
}  

function draw_board( board )
{
  for( var y = 0; y < board_height; y++ )
  {
    for( var x = 0; x < board_width; x++ )
    {
      // TODO: Evaluate board mnemonics
      // Reverse coordinates to map to logical model
      lookup[y][x].className = '';
    }
  }
}
  
function draw_box( color, pixel_x, pixel_y )
{
  var box = null;
    
  // Any boxes showing on board
  if( pixel_y >= 0 )
  {
    box = document.querySelector( 'div[data-position="' + pixel_x + ',' + pixel_y + '"]' );
    box.className = colors[color];                  
  }
}
  
function draw_piece( piece )
{
  var draw = null;
  
  console.log( 'Draw piece.' );
  
  // Piece to draw
  // Rotation to draw
  draw = piece.shape[piece.rotation];
  
  // Look through piece boxes
  for( var x = 0; x < TEMPLATE_WIDTH; x++ )
  {
    for( var y = 0; y < TEMPLATE_HEIGHT; y++ )
    {
      // Fill only if needed
      // Board update will clear last draw
      if( draw[x][y] != BLANK )
      {
        draw_box( piece.color, x + piece.x, y + piece.y );
      }
    }
  }
}
  
function get_blank_board()
{
  var box = null;
  var dom_board = null;
  var dom_row = null;
  var result = null;
  var row = null;
  
  // Board holder
  // Allows independant positioning
  dom_board = document.querySelector( '.board' );
  
  if( dom_board.children.length == 0 )
  {
    // Store DOM references
    // Querying so many is slow
    lookup = [];
    
    // Configure DOM board
    dom_board.style.position = 'absolute';
    dom_board.style.width = ( board_width * box_size ) + 'px';
    dom_board.style.height = ( board_height * box_size ) + 'px';    
    dom_board.style.left = Math.round( ( window.innerWidth - dom_board.clientWidth ) / 2 ) + 'px';
    dom_board.style.bottom = 0;
    dom_board.style.overflow = 'hidden';
    
    // Populate board with boxes
    for( var y = 0; y < board_height; y++ )
    {
      // New row of references
      dom_row = [];
      
      for( var x = 0; x < board_width; x++ )
      {
        // Data attribute for position
        // Easy access for updates
        box = document.createElement( 'div' );
        box.setAttribute( 'data-position', x + ',' + y );
        box.style.position = 'absolute';
        box.style.width = box_size + 'px';
        box.style.height = box_size + 'px';
        box.style.left = ( x * box_size ) + 'px';
        box.style.top = ( y * box_size ) + 'px';
        dom_board.appendChild( box );
        
        dom_row.push( box );
      }
      
      // Add to overall DOM references
      lookup.push( dom_row );
    }
  } else {
    // TODO: Reset DOM board to clear  
  }
  
  // Blank logical board
  result = [];
  
  // Fill logical board with blanks
  for( var y = 0; y < board_height; y++ )
  {
    row = [];
    
    for( var x = 0; x < board_width; x++ )      
    {
      row.push( BLANK );
    }
    
    result.push( row );
  }
  
  return result;
}
  
function get_new_piece()
{
  var index = null;
  var result = null;
  var shape = null;
  
  // Random piece from possibilities
  index = Math.floor( Math.random() * pieces.length );
  shape = pieces[index];

  // Random rotation of piece
  // Horizontally close to center
  // Vertically off top of board
  // Random fill style
  result = {
    shape: shape,
    rotation: Math.floor( Math.random() * shape.length ),
    x: Math.floor( board_width / 2 ) - Math.floor( TEMPLATE_WIDTH / 2 ),
    y: -2,
    color: Math.floor( Math.random() * colors.length )
  };
  
  return result;
}  

function is_on_board( x, y )
{
  var result = null;
  
  // Check board dimensions against box placement
  result = x >= 0 && x < board_width && y < board_height;
  
  return result;
}
  
function is_valid_position( board, piece, adjust_x, adjust_y )
{
  var is_above_board = null;
  
  console.log( 'Check position.' );
  
  // Within the context of the piece
  for( var x = 0; x < TEMPLATE_WIDTH; x++ )
  {
    for( var y = 0; y < TEMPLATE_HEIGHT; y++ )
    {
      // Might be above the board
      is_above_board = y + piece.y + adjust_y < 0;
      
      // Above board or blank area of template
      // Next iteration
      if( is_above_board || piece.shape[piece.rotation][y][x] == BLANK )
      {
        continue;  
      }
      
      // Not on the board
      // TODO: Refactor out the mid-loop return statments
      if( !is_on_board( x + piece.x + adjust_x, y + piece.y + adjust_y ) )
      {
        return false;
      }
      
      // Something already there
      if( board[y + piece.y + adjust_y][x + piece.x + adjust_x] != BLANK )
      {
        return false;
      }
    }
  }
  
  // Everything checks out
  // Valid placement
  return true;
}
  
function tick()
{
  console.log( 'Tick.' );
    
  // Need a new piece in play
  if( piece_falling == null )
  {
    console.log( 'New piece.' );
    
    // Move next piece into play
    // Generate new next piece
    piece_falling = piece_next;
    piece_next = get_new_piece();
    
    // Set timing for next update
    last_down_time = Date.seconds();

    // TODO: Piece does not fit -> game over
  }
  
  // Need to update board
  if( ( Date.seconds() - last_down_time ) > fall_frequency )
  {
    console.log( 'Update.' );
    
    // Piece cannot move down
    if( !is_valid_position( board, piece_falling, 0, 1 ) )
    {
      // Add to board
      add_to_board( board, piece_falling );
      
      // TODO: Increment score
      // TODO: Increment level
      // TODO: Increment fall frequency
      
      // Piece done moving
      piece_falling = null;
    } else {
      // Shift piece down
      // Set timing for next update
      piece_falling.y = piece_falling.y + 1;
      last_down_time = Date.seconds();      
    }
  }
  
  draw_board( board );
  
  // Piece is actively falling
  // Draw the piece in the DOM
  if( piece_falling != null )
  {
    draw_piece( piece_falling );
  }
}
  
function do_window_load()
{
  console.log( 'Load.' );
  
  // Box size based on window size
  box_size = Math.round( window.innerHeight / VERTICAL_BOXES );

  // Plus one to ensure full screen coverage
  board_height = Math.round( window.innerHeight / box_size ) + 1;
  board_width = Math.round( window.innerWidth / box_size ) + 1;

  console.log( 'Box: ' + box_size );
  console.log( 'Board: ' + board_width + ', ' + board_height );

  // Color styles
  colors = [
    'mohsen',
    'bob',
    'michel',
    'peter'
  ];
  
  // Pieces 
  // Resolved from template file
  pieces = [
    SHAPE_S,
    SHAPE_Z,
    SHAPE_J,
    SHAPE_L,
    SHAPE_I,
    SHAPE_O,
    SHAPE_T
  ];    
  
  // Build or clear physical and logical board
  board = get_blank_board();
  
  // Last movement
  last_down_time = Date.seconds();
  
  // Score and level
  // Controls fall rate (frequency)
  score = 0;
  level = calculate_level( score );
  fall_frequency = calculate_fall_frequency( level );
  
  // Piece in play
  // Piece up next
  piece_falling = get_new_piece();
  piece_next = get_new_piece();
  
  // Start game animation
  clock = setInterval( tick, 1000 / FPS );
}
  
window.addEventListener( 'load', do_window_load );  
