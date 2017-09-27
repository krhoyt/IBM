// Constants  
var ACTION_REMOVE = 'barcode_remove';
var ACTION_SHOW = 'barcode_show';
var PREVIEW_GAP = 50;
  
// Application
var cart = null;
var socket = null;  
 
// Called to build line item
// Uses last element in cart
function line() {
  var item = null;
  var list = null;
  var template = null;
  
  // Clone
  template = document.querySelector( '.template' );
  item = template.cloneNode( true );
  
  // Track for removal
  item.setAttribute( 'data-upc', cart[cart.length - 1].upc );  
  
  // Style
  item.classList.remove( 'template' );
  item.classList.add( 'line' );

  // Populate
  item.children[0].style.backgroundImage = 'url( ' + cart[cart.length - 1].image + ' )';
  item.children[1].innerHTML = cart[cart.length - 1].title;
  item.children[3].innerHTML = cart[cart.length - 1].price.toFixed( 2 );

  // Allow for preview
  item.children[0].addEventListener( 'click', doThumbnailClick );  
  
  // Allow for remove
  item.children[4].addEventListener( 'click', doRemoveClick );
  
  // Put in list
  list = document.querySelector( '.list' );
  list.appendChild( item );
}
 
// Called to remove an item
// Remove from cart
// Remove from display
// Total
function remove( upc )
{
  var item = null;
  var list = null;
  
  // Match in data model
  for( var i = 0; i < cart.length; i++ )
  {
    if( cart[i].upc == upc ) 
    {
      index = i;
      break;
    }
  }
  
  // Remove from cart
  cart.splice( index, 1 );  
  
  // Get specific line item
  item = document.querySelector( '.line[data-upc="' + upc + '"]' );
  
  // Clean up listeners
  item.children[0].removeEventListener( 'click', doThumbnailClick );
  item.children[4].removeEventListener( 'click', doRemoveClick );
  
  // Remove from display
  list = document.querySelector( '.list' );
  list.removeChild( item );
  
  // Tally
  total();  
}

// Called to update totals
// Includes item count
function total() {
  var amount = null;
  var count = null;
  var total = null;
  
  // Increment item count
  count = document.querySelector( '.count' );
  count.innerHTML = cart.length;
  
  // Seed total
  total = 0;
  
  // Calculate total
  for( var i = 0; i < cart.length; i++ )
  {
    total = total + cart[i].price;  
  }
  
  // Display total
  amount = document.querySelector( '.amount' );
  amount.innerHTML = total.toFixed( 2 );
}

// Called to put away preview
function doPreviewClick()
{
  var preview = null;
  
  // Access element
  // Remove listener
  preview = document.querySelector( '.preview' );
  preview.removeEventListener( 'click', doPreviewClick );
  
  // Move out of screen
  TweenMax.to( preview, 1, {
    left: 0 - preview.clientWidth - 10,
    onComplete: doPreviewClickComplete
  } );
}

// Called when the preview is put away
// Removes from display
function doPreviewClickComplete()
{
  var preview = null;
  
  // Hide
  preview = document.querySelector( '.preview' );
  preview.style.visibility = 'hidden';
}

// Called to remove an item from the list
// Publish message to remove line item
function doRemoveClick() 
{
  var upc = null;
  
  // Debug
  console.log( 'Remove' );
    
  // Get identifier
  upc = this.parentElement.getAttribute( 'data-upc' );  
    
  // Remove displays
  socket.send( JSON.stringify( {
    action: ACTION_REMOVE,
    upc: upc
  } ) );
}

// Called when message arrives
function doSocketMessage( event )
{
  var data = null;
  
  // Parse JSON
  data = JSON.parse( event.data );
  
  // Decision tree for incoming action
  // Display actual scanner values
  if( data.action == ACTION_SHOW )
  {
    // Add to cart
    cart.push( data );
    
    // Update user interface
    line();
    total();
    
    // Debug
    console.log( data.upc );
    console.log( data.title );
    console.log( data.price );    
    console.log( data.image );
  } else if( data.action == ACTION_REMOVE ) {
    remove( data.upc );  
  }
}

// Called when connected to WebSocket
// Listen for messages
function doSocketOpen()
{
  console.log( 'Socket open.' );
  
  // Listen
  socket.addEventListener( 'message', doSocketMessage );
}

// Called when line item thumbnail is clicked
// Shows larger preview image
function doThumbnailClick()
{
  var preview = null;
  var scaling = null;
  
  // Element
  preview = document.querySelector( '.preview' );
  
  // Background
  preview.style.backgroundImage = this.style.backgroundImage;
  
  if( window.innerWidth > window.innerHeight )
  {
    scaling = window.innerHeight;  
  } else {
    scaling = window.innerWidth;
  }
  
  // Size and position
  preview.style.height = ( scaling - PREVIEW_GAP ) + 'px';
  preview.style.width = ( scaling - PREVIEW_GAP ) + 'px';
  preview.style.left = ( window.innerWidth + 10 ) + 'px';
  preview.style.top = Math.round( ( window.innerHeight - preview.clientHeight ) / 2 ) + 'px';
  preview.style.visibility = 'visible';
  
  // Event to put away
  preview.addEventListener( 'click', doPreviewClick );
  
  // Show
  TweenMax.to( preview, 1, {
    left: Math.round( ( window.innerWidth - preview.clientWidth ) / 2 )
  } );
}

// Called when document is loaded
// Connect to Gateway
function doWindowLoad()
{
  var button = null;
  
  // Easter egg for Peter
  button = document.querySelector( 'button' );
  button.addEventListener( 'click', function() {
    socket.send( JSON.stringify( {
      action: ACTION_SHOW,
      image: '../img/stores/dobos-torta.jpg',
      price: 3,      
      title: "Dobos Torta",
      upc: Date.now()                      
    } ) );
  } );
  
  // Initialize cart
  cart = [];
  
  // alert( window.innerWidth );
  
  // Connect to WebSocket
  socket = new WebSocket( 'ws://' + window.location.host );
  socket.addEventListener( 'open', doSocketOpen );
}
  
// Listen for document to load
window.addEventListener( 'load', doWindowLoad );
