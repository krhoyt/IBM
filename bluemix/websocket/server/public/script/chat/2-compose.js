// Constant
var CLIENT_PREFIX = 'chat_'; 
var HISTORY_PATH = '/api/chat';
    
// Application
var client = null;
var color = null;
var history = null;
var message = null;
var placeholder = null;
var socket = null;
var xhr = null;
        
function createItem( client, css, message ) {
    var item = null;
    
    // Debug
    console.log( 'Create item.' );
    
    // Build chat line item
    item = document.createElement( 'div' );
    item.setAttribute( 'data-client', client );
    item.style.color = css;
    item.innerHTML = message;

    // Populate DOM
    history.appendChild( item );        
}

function doHistoryLoad() {
    var data = null;
    
    // Debug
    console.log( 'History load.' );
    
    // Parse
    data = JSON.parse( xhr.responseText );
    
    // Populate history
    for( var d = 0; d < data.length; d++ ) {
        createItem( data[d].client, data[d].css, data[d].message );        
    }
    
    // Clean up
    xhr.removeEventListener( 'load', doHistoryLoad );
    xhr = null;
}

function doMessageBlur() {
    // Debug
    console.log( 'Message blur.' );
    
    // Add styling
    message.classList.add( 'placeholder' );
    
    // Replace placeholder if needed
    if( message.innerHTML.trim().length == 0 )
    {
        message.innerHTML = placeholder;  
    }    
}
    
function doMessageFocus() {
    // Debug
    console.log( 'Message focus.' );
    
    // Remove styling
    message.classList.remove( 'placeholder' );
    
    // Clear if needed
    if( message.innerHTML == placeholder )
    {
        message.innerHTML = '';  
    }    
}
    
function doMessageKey( event ) {
    var body = null;
    
    // Enter key
    // And something typed
    // Build and send message
    if( event.keyCode == 13 && message.innerHTML.trim().length > 0 )
    {      
        // Build object
        body = {
            blue: color.blue,
            client: client,
            css: color.css,
            green: color.green,
            message: message.innerHTML.trim(),
            red: color.red
        };
    
        // Send
        // Includes serialization
        socket.send( JSON.stringify( body ) );
      
        // Clear chat just sent
        message.innerHTML = '';
      
        // Debug
        console.log( 'Chat sent.' );
    }    
}
    
function doSocketMessage( event ) {
    var body = null;
    
    // Debug
    console.log( event.data );
    
    // Get data
    body = JSON.parse( event.data );

    // Create a chat line item
    createItem( body.client, body.css, body.message );
}
    
function doSocketOpen() {
    // Debug
    console.log( 'Socket open.' );
    
    // Listen for messages
    socket.addEventListener( 'message', doSocketMessage );
    
    // History
    history = document.querySelector( '.history' );
    
    // Listen for interactions
    message = document.querySelector( '.message' );
    message.contentEditable = true;
    message.addEventListener( 'focus', doMessageFocus );
    message.addEventListener( 'blur', doMessageBlur );
    message.addEventListener( 'keypress', doMessageKey );
    
    // Pull placeholder from DOM
    placeholder = message.innerHTML;
}
    
function doWindowLoad() {
    var blue = null;
    var green = null;
    var red = null;
    
    // Debug
    console.log( 'Load.' );
    
    // Color for user
    red = Math.round( Math.random() * 255 );
    green = Math.round( Math.random() * 255 );
    blue = Math.round( Math.random() * 255 );
    
    color = {
        red: red,
        green: green,
        blue: blue,
        css: 'rgb( ' + red + ', ' + green + ', ' + blue + ' )'
    };
        
    // Client identification
    client = CLIENT_PREFIX + Date.now();    
    
    // Load history
    xhr = new XMLHttpRequest();
    xhr.addEventListener( 'load', doHistoryLoad );
    xhr.open( 'GET', HISTORY_PATH );
    xhr.send( null );
    
    // WebSocket
    socket = new WebSocket( 'ws://' + window.location.host );
    socket.addEventListener( 'open', doSocketOpen );
}
    
// Go
window.addEventListener( 'load', doWindowLoad );
