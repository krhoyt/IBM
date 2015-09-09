var BOARD_HEIGHT = 22;
var BOARD_WIDTH = 10;
  
var board = null;
var management = null;
var square_size = null;    
  
function build_board()
{
  var block = null;
  
  // Down the left
  for( var b = 0; b < BOARD_HEIGHT; b++ )
  {
    block = document.createElement( 'div' );
    block.classList.add( 'board_border' );
    block.style.width = square_size + 'px';
    block.style.height = square_size + 'px';      
    block.style.top = ( b * square_size ) + 'px';
    board.appendChild( block );
  }
  
  // Across the bottom
  for( b = 0; b < ( BOARD_WIDTH + 2 ); b++ )
  {
    block = document.createElement( 'div' );
    block.classList.add( 'board_border' );
    block.style.width = square_size + 'px';
    block.style.height = square_size + 'px';      
    block.style.left = ( b * square_size ) + 'px';
    block.style.top = ( BOARD_HEIGHT * square_size ) + 'px';    
    board.appendChild( block );
  }  
  
  // Down the right
  for( b = 0; b < BOARD_HEIGHT; b++ )
  {
    block = document.createElement( 'div' );
    block.classList.add( 'board_border' );
    block.style.width = square_size + 'px';
    block.style.height = square_size + 'px';      
    block.style.left = ( ( BOARD_WIDTH + 1 ) * square_size ) + 'px';
    block.style.top = ( b * square_size ) + 'px';    
    board.appendChild( block );
  }    
}
  
function build_i()
{
  var block = null;
  var person = null;
  var square = null;
  
  // Person to fill block
  person = Math.floor( Math.random() * management.length );
  
  // Block
  block = document.createElement( 'div' );
  block.classList.add( 'block' );
  block.style.width = square_size + 'px';
  block.style.height = ( 4 * square_size ) + 'px';  
  
  // First
  square = document.createElement( 'div' );
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );
  
  // Second
  square = document.createElement( 'div' );
  square.style.top = square_size + 'px';
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );  
  
  // Third
  square = document.createElement( 'div' );
  square.style.top = ( 2 * square_size ) + 'px';
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );    
  
  // Fourth
  square = document.createElement( 'div' );
  square.style.top = ( 3 * square_size ) + 'px';  
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );    
  
  return block;
}
  
function build_j()
{
  var block = null;
  var person = null;
  var square = null;
  
  // Person to fill block
  person = Math.floor( Math.random() * management.length );
  
  // Block
  block = document.createElement( 'div' );
  block.classList.add( 'block' );
  block.style.width = ( 2 * square_size ) + 'px';
  block.style.height = ( 3 * square_size ) + 'px';  
  
  // First
  square = document.createElement( 'div' );
  square.style.left = square_size + 'px';
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );
  
  // Second
  square = document.createElement( 'div' );
  square.style.left = square_size + 'px';  
  square.style.top = square_size + 'px';
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );  
  
  // Third
  square = document.createElement( 'div' );
  square.style.left = square_size + 'px';  
  square.style.top = ( 2 * square_size ) + 'px';
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );    
  
  // Fourth
  square = document.createElement( 'div' );
  square.style.top = ( 2 * square_size ) + 'px';  
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );    
  
  return block;
}    
  
function build_l()
{
  var block = null;
  var person = null;
  var square = null;
  
  // Person to fill block
  person = Math.floor( Math.random() * management.length );
  
  // Block
  block = document.createElement( 'div' );
  block.classList.add( 'block' );
  block.style.width = ( 2 * square_size ) + 'px';
  block.style.height = ( 3 * square_size ) + 'px';  
  
  // First
  square = document.createElement( 'div' );
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );
  
  // Second
  square = document.createElement( 'div' );
  square.style.top = square_size + 'px';
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );  
  
  // Third
  square = document.createElement( 'div' );
  square.style.top = ( 2 * square_size ) + 'px';
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );    
  
  // Fourth
  square = document.createElement( 'div' );
  square.style.left = square_size + 'px';  
  square.style.top = ( 2 * square_size ) + 'px';  
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );    
  
  return block;
}  
  
function build_o()
{
  var block = null;
  var person = null;
  var square = null;
  
  // Person to fill block
  person = Math.floor( Math.random() * management.length );
  
  // Block
  block = document.createElement( 'div' );
  block.classList.add( 'block' );
  block.style.width = ( 2 * square_size ) + 'px';
  block.style.height = ( 2 * square_size ) + 'px';  
  
  // Upper left
  square = document.createElement( 'div' );
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );
  
  // Upper right
  square = document.createElement( 'div' );
  square.style.left = square_size + 'px';
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );  
  
  // Bottom left
  square = document.createElement( 'div' );
  square.style.top = square_size + 'px';
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );    
  
  // Bottom right
  square = document.createElement( 'div' );
  square.style.left = square_size + 'px';
  square.style.top = square_size + 'px';  
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );    
  
  return block;
}
  
function build_s()
{
  var block = null;
  var person = null;
  var square = null;
  
  // Person to fill block
  person = Math.floor( Math.random() * management.length );
  
  // Block
  block = document.createElement( 'div' );
  block.classList.add( 'block' );
  block.style.width = ( 3 * square_size ) + 'px';
  block.style.height = ( 2 * square_size ) + 'px';  
  
  // Upper left
  square = document.createElement( 'div' );
  square.style.left = square_size + 'px';
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );
  
  // Upper right
  square = document.createElement( 'div' );
  square.style.left = ( 2 * square_size ) + 'px';
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );  
  
  // Bottom left
  square = document.createElement( 'div' );
  square.style.top = square_size + 'px';
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );    
  
  // Bottom right
  square = document.createElement( 'div' );
  square.style.left = square_size + 'px';
  square.style.top = square_size + 'px';  
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );    
  
  return block;
}
  
function build_t()
{
  var block = null;
  var person = null;
  var square = null;
  
  // Person to fill block
  person = Math.floor( Math.random() * management.length );
  
  // Block
  block = document.createElement( 'div' );
  block.classList.add( 'block' );
  block.style.width = ( 3 * square_size ) + 'px';
  block.style.height = ( 2 * square_size ) + 'px';  
  
  // Upper left
  square = document.createElement( 'div' );
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );
  
  // Upper middle
  square = document.createElement( 'div' );
  square.style.left = square_size + 'px';
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );  
  
  // Upper right
  square = document.createElement( 'div' );
  square.style.left = ( 2 * square_size ) + 'px';
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );    
  
  // Bottom (middle)
  square = document.createElement( 'div' );
  square.style.left = square_size + 'px';
  square.style.top = square_size + 'px';  
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );    
  
  return block;
}  
  
function build_z()
{
  var block = null;
  var person = null;
  var square = null;
  
  // Person to fill block
  person = Math.floor( Math.random() * management.length );
  
  // Block
  block = document.createElement( 'div' );
  block.classList.add( 'block' );
  block.style.width = ( 3 * square_size ) + 'px';
  block.style.height = ( 2 * square_size ) + 'px';  
  
  // Upper left
  square = document.createElement( 'div' );
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );
  
  // Upper right
  square = document.createElement( 'div' );
  square.style.left = square_size + 'px';
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );  
  
  // Bottom left
  square = document.createElement( 'div' );
  square.style.left = square_size + 'px';  
  square.style.top = square_size + 'px';
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );    
  
  // Bottom right
  square = document.createElement( 'div' );
  square.style.left = ( 2 * square_size ) + 'px';
  square.style.top = square_size + 'px';  
  square.style.width = square_size + 'px';
  square.style.height = square_size + 'px';
  square.classList.add( management[person] );
  block.appendChild( square );    
  
  return block;
}  
  
function doWindowLoad()
{
  management = [
    'mohsen',
    'bob',
    'michel'
  ];
  
  square_size = Math.floor( window.innerHeight / BOARD_HEIGHT );
  
  board = document.querySelector( '.board' );
  board.style.width = ( square_size * ( BOARD_WIDTH + 2 ) ) + 'px';
  board.style.height = ( square_size * ( BOARD_HEIGHT + 1 ) ) + 'px';
  board.style.left = Math.round( ( window.innerWidth - board.clientWidth ) / 2 ) + 'px';
  
  build_board();
  
  current = build_i();
  current.style.left = ( ( Math.floor( BOARD_WIDTH / 2 ) ) * square_size ) + 'px';
  current.style.top = 0;
  board.appendChild( current );
}
  
window.addEventListener( 'load', doWindowLoad );
