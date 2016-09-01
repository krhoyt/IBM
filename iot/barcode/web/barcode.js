var Barcode = ( function() {
    
    // Private
    var barcode = null;
    var socket = null;
    
    var doSocketMessage = function( event ) {
        var data = null;
        
        // Debug
        console.log( 'Message' );
        
        // Put into web page
        data = JSON.parse( event.data );
        barcode.innerHTML = data.barcode;
    };
    
    var doSocketOpen = function() {
        // Debug
        console.log( 'Open' );
    };
    
    // Debug
    console.log( 'Barcode' );
    
    // Barcode reference
    barcode = document.querySelector( '#barcode' );
    
    // Connect via WebSocket
    socket = new WebSocket( 'ws://visual.mybluemix.net/ws/barcode' );
    socket.addEventListener( 'open', doSocketOpen );
    socket.addEventListener( 'message', doSocketMessage );
    
    // Reveal
    return {
        
    };
    
} )();    
