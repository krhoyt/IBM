// Constants
var ACTION_CREATE = 'create';
var ACTION_READ_ALL = 'read_all';
var AVATAR_HDC = 'hdc.svg';
var AVATAR_KEVIN = 'kevin.jpg';
var AVATAR_PATH = '/avatar/';
var BUBBLE_COLOR = '/img/chat_bubble_teal.svg';    
var BUBBLE_GRAY = '/img/chat_bubble_gray.svg';
var CLIENT_PREFIX = 'chat_';
var SOCKET_PROTOCOL = 'ws://';    
    
// Application
var client = null;
var color = null;
var interval = null;
var latitude = null;
var longitude = null;
var socket = null;    

function createChat( client, message, created ) {
    var bubble = null;
    var clone = null;
    var content = null;
    var history = null;
    var template = null;
    var timestamp = null;
    
    // Copy
    template = document.querySelector( '.chat.template' );
    clone = template.cloneNode( true );
    
    // Client identification
    clone.setAttribute( 'data-client', client );      
    
    // Message content
    content = clone.querySelector( 'p:first-of-type' );
    content.innerHTML = message;    
        
    // Message timestamp
    timestamp = clone.querySelector( '.bubble p:last-of-type' );
    timestamp.setAttribute( 'data-timestamp', Date.parse( created ) );
    timestamp.innerHTML = 'Now';
    
    // Place in history
    history = document.querySelector( '.history' );
    history.appendChild( clone );
    
    // Reveal
    clone.classList.remove( 'template' );    
    
    // Sizing
    // Size not calculated until after display
    bubble = clone.querySelector( '.bubble' );
    clone.style.height = bubble.clientHeight + 'px';    
}

// Called when fous is removed
// Changes indicator icon
function doInputBlur() {
    var message = null;
    
    // Debug
    console.log( 'Blur.' );
    
    // Change indicator icon
    message = document.querySelector( '.message' );
    message.style.backgroundImage = 'url( ' + BUBBLE_GRAY + ' )';
}

// Called to emphasize focus
// Changes indicator icon
function doInputFocus() {
    var message = null;
    
    // Debug
    console.log( 'Focus.' );
    
    // Change indicator icon
    message = document.querySelector( '.message' );
    message.style.backgroundImage = 'url( ' + BUBBLE_COLOR + ' )';
}

// Called while typing message
// Watch for enter key to send message
// Make sure there is a message to send
function doInputKey( event ) {
    var message = null;
    
    // Debug
    console.log( 'Typing...' );
    
    // Enter key
    // Message has content
    if( event.keyCode == 13 && this.value.trim().length > 0 ) {
        // Debug
        console.log( 'Send.' );        
        
        // Message content
        // Several unused attributes
        // In place for future features
        message = {
            avatar: AVATAR_PATH + AVATAR_HDC,
            client: CLIENT_PREFIX + client,
            content: this.value.trim(),
            echo: true,
            image: null,
            latitude: null,
            longitude: null,
            timestamp: Date.now()
        };
    
        // Send message
        socket.send( JSON.stringify( message ) );        
        
        // Clear input
        this.value = '';
        
        // Stop bubbling
        return false;
    }
}
    
// Got a message
function doSocketMessage( event ) {
    var body = null;
 
    // Debug
    console.log( event.data );    
    
    // Get data
    body = JSON.parse( event.data );

    // Action
    switch( body.action ) {
        // History
        case ACTION_READ_ALL:
            for( var i = 0; i < body.data.length; i++ ) {
                createChat( 
                    body.data[i].client,
                    body.data[i].message,
                    body.data[i].createdAt
                );
            }
            
            break;
            
        // New chat item
        case ACTION_CREATE:
            createChat( 
                body.data.client, 
                body.data.message,
                body.data.createdAt
            );            
            
            break;
    }    
}

// Connected to server
function doSocketOpen() {
    var input = null;
    
    // Debug
    console.log( 'Open.' );
    
    // Enable sending messages
    input = document.querySelector( 'input[type=\'text\']' ); 
    input.addEventListener( 'keypress', doInputKey );    
    input.addEventListener( 'focus', doInputFocus );
    input.addEventListener( 'blur', doInputBlur );
    
    // Load history
    socket.send( JSON.stringify( {
        action: ACTION_READ_ALL    
    } ) );        
}

// Update history timestamps
function doTimestamp() {
    var history = null;
    var timestamp = null;
    
    // Debug
    console.log( 'Timestamps.' );
    
    // Now
    now = new Date();
    
    // Chat message timestamps
    history = document.querySelectorAll( '.chat .bubble p:last-of-type' );
    
    // Update timestamps
    for( var h = 0; h < history.length; h++ ) {
        timestamp = parseInt( history[h].getAttribute( 'data-timestamp' ) );
        history[h].innerHTML = moment( timestamp ).fromNow();
    }
}

// Window loaded
function doWindowLoad() {
    var blue = null;
    var green = null;
    var red = null;    
    
    // Debug
    console.log( 'Load.' );
    
    // Client ID
    client = CLIENT_PREFIX + Date.now();
    
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
    
    // WebSocket
    socket = new WebSocket( SOCKET_PROTOCOL + window.location.host );
    socket.addEventListener( 'open', doSocketOpen );
    socket.addEventListener( 'message', doSocketMessage );
    
    // Update timestamp in messages
    interval = setInterval( doTimestamp, 30000 );
}
    
// Go
window.addEventListener( 'load', doWindowLoad );    
