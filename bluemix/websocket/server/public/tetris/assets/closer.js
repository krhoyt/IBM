var FPS = 25;
var WINDOW_WIDTH = 640;
var WINDOW_HEIGHT = 480;
var BOX_SIZE = 20;
var BOARD_WIDTH = 10;
var BOARD_HEIGHT = 20;
var BLANK = '.';
  
var MOVE_SIDEWAYS_FREQUENCY = 0.15;
var MOVE_DOWN_FREQUENCY = 0.10;
  
var XMARGIN = Math.round( ( WINDOW_WIDTH - BOARD_WIDTH * BOX_SIZE ) / 2 );
var TOP_MARGIN = WINDOW_HEIGHT - ( BOARD_HEIGHT * BOX_SIZE ) - 5;
  
var WHITE        = 'rgb( 255, 255, 255 )';
var GRAY         = 'rgb( 185, 185, 185 )';
var BLACK        = 'rgb(   0,   0,   0 )';  
var RED          = 'rgb( 155,   0,   0 )';  
var LIGHT_RED    = 'rgb( 175,  20,  20 )';
var GREEN        = 'rgb(   0, 155,   0 )';  
var LIGHT_GREEN  = 'rgb(  20, 175,  20 )';    
var BLUE         = 'rgb(   0,   0, 155 )';    
var LIGHT_BLUE   = 'rgb(  20,  20, 175 )';    
var YELLOW       = 'rgb( 155, 155,   0 )';    
var LIGHT_YELLOW = 'rgb( 175, 175,  20 )';    
  
var BORDER_COLOR = BLUE;
var BACKGROUND_COLOR = BLACK;
var TEXT_COLOR = WHITE;
var TEXT_SHADOW = GRAY;
var COLORS = [BLUE, GREEN, RED, YELLOW];
var LIGHT_COLORS = [LIGHT_BLUE, LIGHT_RED, LIGHT_YELLOW];
  
var TEMPLATE_WIDTH = 5;
var TEMPLATE_HEIGHT = 5;
  
var S_SHAPE_TEMPLATE = [['.....',
                         '.....',
                         '..oo.',
                         '.oo..',
                         '.....'],
                        ['.....',
                         '..o..',
                         '..oo.',
                         '...o.',
                         '.....']];
  
var Z_SHAPE_TEMPLATE = [['.....',
                         '.....',
                         '.oo..',
                         '..oo.',
                         '.....'],
                        ['.....',
                         '..o..',
                         '.oo..',
                         '.o...',
                         '.....']];  
  
var I_SHAPE_TEMPLATE = [['..o..',
                         '..o..',
                         '..o..',
                         '..o..',
                         '.....'],
                        ['.....',
                         '.....',
                         'oooo.',
                         '.....',
                         '.....']];    

var O_SHAPE_TEMPLATE = [['.....',
                         '.....',
                         '.oo..',
                         '.oo..',
                         '.....']];   
  
var J_SHAPE_TEMPLATE = [['.....',
                         '.o...',
                         '.ooo.',
                         '.....',
                         '.....'],
                        ['.....',
                         '..oo.',
                         '..o..',
                         '..o..',
                         '.....'],
                        ['.....',
                         '.....',
                         '.ooo.',
                         '...o.',
                         '.....'],
                        ['.....',
                         '..o..',
                         '..o..',
                         '.oo..']];     
  
var L_SHAPE_TEMPLATE = [['.....',
                         '...o.',
                         '.ooo.',
                         '.....',
                         '.....'],
                        ['.....',
                         '..o..',
                         '..o..',
                         '..oo.',
                         '.....'],
                        ['.....',
                         '.....',
                         '.ooo.',
                         '.o...',
                         '.....'],
                        ['.....',
                         '.oo..',
                         '..o..',
                         '..o..']];
  
var T_SHAPE_TEMPLATE = [['.....',
                         '..o..',
                         '.ooo.',
                         '.....',
                         '.....'],
                        ['.....',
                         '..o..',
                         '..oo.',
                         '..o..',
                         '.....'],
                        ['.....',
                         '.....',
                         '.ooo.',
                         '..o..',
                         '.....'],
                        ['.....',
                         '..o..',
                         '.oo..',
                         '..o..',
                         '.....']];
  
var PIECES = [
  S_SHAPE_TEMPLATE,
  Z_SHAPE_TEMPLATE,
  J_SHAPE_TEMPLATE,
  L_SHAPE_TEMPLATE,
  I_SHAPE_TEMPLATE,
  O_SHAPE_TEMPLATE,
  T_SHAPE_TEMPLATE
];

function calculate_fall_frequency( level )
{
  return 0.27 - ( level * 0.02 );
}
  
function calculate_level( score ) 
{
  return Math.round( score / 10 ) + 1;
}

function draw_board( board ) 
{
  // Draw border
  
  for( var x = 0; x < BOARD_WIDTH; x++ ) 
  {
    for( var y = 0; y < BOARD_HEIGHT; y++ ) 
    {
      draw_box( x, y, board[x][y] );  
    }
  }
}
  
function get_blank_board()
{
  var board = null;
  var row = null;
  
  board = [];
  
  for( var h = 0; h < BOARD_HEIGHT; h++ )
  {
    row = '';
    
    for( var w = 0; w < BOARD_WIDTH; w++ ) 
    {
      row = row + BLANK;
    }
    
    board.push( row );
  }
  
  return board;
}
  
function get_new_piece()
{
  var shape = null;
  
  shape = PIECES[Math.floor( Math.random() * PIECES.length )];
  
  return {
    shape: shape,
    rotation: Math.floor( Math.random() * shape.length ),
    x: Math.round( BOARD_WIDTH / 2 ) - Math.round( TEMPLATE_WIDTH / 2 ),
    y: -2,
    color: Math.floor( Math.random() * COLORS.length )
  };
}

function is_on_board( x, y )
{
  return x >= 0 && BOARD_WIDTH && y < BOARD_HEIGHT;
}
  
// Return true if within board and not colliding
function is_valid_position( board, piece, adjust_x, adjust_y )
{
  var is_above_board = null;

  for( var h = 0; h < TEMPLATE_HEIGHT; h++ )
  {
    for( var w = 0; w < TEMPLATE_WIDTH; w++ )
    {
      is_above_board = w + piece.x + adjust_x < 0;
      
      if( is_above_board || piece.shape[piece.rotation][w][h] == BLANK )
      {
        continue;
      }
      
      if( !is_on_board( w + piece.x + adjust_x, h + piece.y + adjust_y ) )
      {
        return false;  
      }
      
      if( board[w + piece.x + adjust_x][h + piece.y + adjust_y] != BLANK )
      {
        return false;                                  
      }
    }
  }
  
  return true;
}
  
function doWindowLoad()
{
  var board = null;
  var fall_frequency = null;
  var last_fall_time = null;
  var last_move_down_time = null;
  var last_sideways_move_time = null;
  var level = null;
  var moving_down = null;
  var moving_left = null;
  var moving_right = null;
  var score = null;
  
  board = get_blank_board();
  
  last_move_down_time = Date.now();
  last_sideways_move_time = Date.now();
  last_fall_time = Date.now();
  
  // There is no moving up
  moving_down = false;
  moving_left = false;
  moving_right = false;
  
  score = 0;
  
  level = calculate_level( score );
  fall_frequency = calculate_fall_frequency( level );
  
  falling_piece = get_new_piece();
  next_piece = get_new_piece();
  
  // Game loop
  
  // Put new piece in play
  if( falling_piece == null )
  {
    falling_piece = next_piece;
    next_piece = get_new_piece();
    last_fall_time = Date.now();
    
    // Game over
    if( !isValidPosition( board, falling_piece, 0, 0 ) )
    {
      console.log( 'Game over.' );
      return;  
    }
  }
  
  // Put it on the screen
  draw_board( board );
}
  
window.addEventListener( 'load', doWindowLoad );
