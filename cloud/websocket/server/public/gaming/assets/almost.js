var BLANK = '.';
var FPS = 25;
var TEMPLATE_HEIGHT = 5;
var TEMPLATE_WIDTH = 5;
  
var board = null;
var board_height = null;
var box_size = null;
var colors = null;
var piece_falling = null;
var piece_next = null;  
var pieces = null;

var clock = null;
var fall_frequency = null;
var last_down_time = null;
var last_fall_time = null;
var last_side_time = null;
var level = null;
var moving_down = null;
var moving_left = null;
var moving_right = null;
var score = null;

Date.seconds = function()
{
  return Math.floor( Date.now() / 1000 );
}
  
function build_blank_board()
{
  var pixel = null;
  
  if( document.body.children.length == 0 )
  {
    for( var x = 0; x < board_width; x++ )
    {
      for( var y = 0; y < board_height; y++ )
      {
        pixel = document.createElement( 'div' );
        pixel.setAttribute( 'data-position', x + ',' + y );
        pixel.style.position = 'absolute';
        pixel.style.width = box_size + 'px';
        pixel.style.height = box_size + 'px';
        pixel.style.left = ( box_size * x ) + 'px';
        pixel.style.top = ( box_size * y ) + 'px';
        document.body.appendChild( pixel );        
      }
    }
  } else {
    
  }
}
  
function calculate_fall_frequency( level )
{
  var result = null;
  
  result = 0.27 - ( level * 0.02 );
  
  return result;
}
  
function calculate_level( score ) 
{
  var result = null;
  
  result = Math.round( score / 10 ) + 1;
  
  return result;
}  

function check_for_quit() 
{
  // Escape as state machine?
}
  
function convert_pixel_coordinates( box_x, box_y )
{
  var pixel_x = null;
  var pixel_y = null;
  
  pixel_x = box_x * box_size;
  pixel_y = box_y * box_size;
  
  return {
    pixel_x: pixel_x,
    pixel_y: pixel_y
  };
}
  
function draw_board( board )
{
  for( var x = 0; x < board_width; x++ )
  {
    for( var y = 0; y < board_height; y++ )
    {
      draw_box( x, y, board[y][x], null, null );  
    }
  }
}
  
function draw_box( box_x, box_y, color, pixel_x, pixel_y )
{
  var box = null;
  var coordinates = null;
  
  if( color == BLANK )
  {
    return;  
  }
  
  // TODO: Do I need this?
  if( pixel_x == null && pixel_y == null )
  {
    pixel_x = box_x;
    pixel_y = box_y;
    /*
    coordinates = convert_pixel_coordinates( box_x, box_y );
    
    pixel_x = coordinates.pixel_x;
    pixel_y = coordinates.pixel_y;
    */
  }
  
  box = document.querySelector( 'div[data-position="' + pixel_x + ',' + pixel_y + '"]' );
  box.classList.add( colors[color] );
  
  // TODO: Draw board box
  // TODO: Need to create board grid in DOM first
}
  
function draw_piece( piece, pixel_x, pixel_y )
{
  var draw = null;
  
  console.log( 'Draw piece.' );
  
  draw = piece.shape[piece.rotation];
  
  for( var x = 0; x < TEMPLATE_WIDTH; x++ )
  {
    for( var y = 0; y < TEMPLATE_HEIGHT; y++ )
    {
      if( draw[y][x] != BLANK )
      {
        draw_box( null, null, piece.color, pixel_x + x, pixel_y + y );
      }
    }
  }
}
  
function get_blank_board()
{
  var result = null;
  var row = null;
  
  result = [];
  
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
  
  index = Math.floor( Math.random() * pieces.length );
  shape = pieces[index];

  result = {
    shape: shape,
    rotation: Math.floor( Math.random() * shape.length ),
    x: Math.floor( board_width / 2 ) - Math.floor( TEMPLATE_WIDTH / 2 ),
    y: -2,
    color: Math.floor( Math.random() * colors.length ),
    index: index
  };
  
  return result;
}
 
function is_complete_line( board, y )
{
  var result = null;
  
  result = true;
  
  for( var x = 0; x < board_width; x++ )
  {
    if( board[x][y] == BLANK )
    {
      result = false;
      break;
    }
  }
  
  return result;
}
  
function is_on_board( x, y )
{
  var result = null;
  
  result = x >= 0 && x < board_width && y < board_height;
  
  return result;
}
  
function is_valid_position( board, piece, adjust_x, adjust_y )
{
  var is_above_board = null;
  
  for( var x = 0; x < TEMPLATE_WIDTH; x++ )
  {
    for( var y = 0; y < TEMPLATE_HEIGHT; y++ )
    {      
      is_above_board = y + piece.y + adjust_y < 0;
      
      if( is_above_board || piece.shape[piece.rotation][y][x] == BLANK )
      {
        console.log( 'Above.' );
        continue; 
      }
      
      if( !is_on_board( x + piece.x + adjust_x, y + piece.y + adjust_y ) )
      {
        console.log( 'Not on board.' );
        return false;
      }
      
      if( board[y + piece.y + adjust_y][x + piece.x + adjust_x] != BLANK )
      {
        console.log( 'Not a blank.' );
        return false;  
      }
    }
  }
  
  return true;
}

function tick()
{
  console.log( 'Tick.' );
  
  if( piece_falling == null )
  {
    console.log( 'New piece.' );
    
    piece_falling = piece_next;
    piece_next = get_new_piece();
    
    last_fall_time = Date.seconds();
    
    // Game over
    if( !is_valid_position( board, piece_falling, 0, 0 ) ) 
    {
      console.log( 'Game over.' );
      return;  
    }
  }
  
  check_for_quit();
 
  // TODO: Event state machine
  
  console.log( 'Let fall.' );
  
  if( ( Date.seconds() - last_fall_time ) > fall_frequency )
  {
    console.log( 'Falling from: ' + piece_falling.y );
    
    // Check to see if landed
    if( !is_valid_position( board, piece_falling, 0, 1 ) )
    {
      console.log( 'Landed.' );
      
      add_to_board( board, piece_falling );
      score = score + remove_complete_lines( board );
      level = calculate_level( score );
      fall_frequency = calculate_fall_frequency( level );
      piece_falling = null;
    } else {
      console.log( 'Move down: ' + piece_falling.y );
      
      piece_falling.y = piece_falling.y + 1;
      last_fall_time = Date.seconds();  
    }
  }
  
  draw_board( board );
  
  if( piece_falling != null )
  {
    draw_piece( piece_falling );  
  }
}
  
function do_window_load()
{
  box_size = Math.round( window.innerHeight / 20 );

  board_height = Math.round( window.innerHeight / box_size );
  board_width = Math.round( window.innerWidth / box_size );

  console.log( 'Box: ' + box_size );
  console.log( 'Board: ' + board_width + ', ' + board_height );

  colors = [
    'mohsen',
    'bob',
    'michel'
  ];
  
  pieces = [
    SHAPE_S,
    SHAPE_Z,
    SHAPE_J,
    SHAPE_L,
    SHAPE_I,
    SHAPE_O,
    SHAPE_T
  ];    
  
  board = get_blank_board();
  build_blank_board();
  
  last_down_time = Date.seconds();
  last_side_time = Date.seconds();
  
  moving_down = false;
  moving_left = false;
  moving_right = false;
  
  score = 0;
  level = calculate_level( score );
  fall_frequency = calculate_fall_frequency( level );
  
  piece_falling = get_new_piece();
  piece_next = get_new_piece();
  
  clock = setInterval( tick, 1000 / FPS );
}
  
window.addEventListener( 'load', do_window_load );  
