var Conversation = ( function() {

    // Private
    var subscribers = null;
    var xhr = null;
    
    // Ask Watson for conversation intent
    var dialog = function( phrase ) {
        // Debug
        console.log( 'Determining intent ...' );
        
        // Determine intent
        xhr = new XMLHttpRequest();
        xhr.addEventListener( 'load', doIntentLoad );
        xhr.open( 'POST', SERVER_PATH + 'conversation/intent', true );
        xhr.setRequestHeader( 'Content-Type', 'application/json' );    
        xhr.send( JSON.stringify( {
            text: phrase
        } ) );            
    };

    // Fire an event
    var emit = function( name, data ) {
        // Debug
        // console.log( 'Visiting: ' + name );
        
        // Notify subscribers
        for( var s = 0; s < subscribers.length; s++ ) {
            if( subscribers[s].name == name ) {
                subscribers[s].callback( data );
            }
        }
    };
        
    // Observer pattern
    // Register event handlers
    var on = function( name, callback ) {
        // Debug
        console.log( 'Register: ' + name );
        
        // Initialize if needed
        if( subscribers == null ) {
            subscribers = [];
        }
        
        // Track listener
        subscribers.push( {
            callback: callback,
            name: name
        } );
    };
        
    // Intent located
    var doIntentLoad = function() {
        var data = null;

        // Parse JSON response
        data = JSON.parse( xhr.responseText );

        // Debug
        console.log( 'Intent retrieved.' );
        
        // Sampling of intent results
        console.log( data );
        console.log( data.intents[0].intent );
        console.log( data.output.text[0] );

        // Catch special circumstances
        if( data.intents[0].intent == 'time' ) {
            data.output.text[0] = 
                data.output.text[0] + ' ' + 
                moment().format( 'h:mm A' ) + '.';
        }

        // Notify UI of discovered intent
        // UI will display and speak results        
        emit( Conversation.INTENT, {
            intent: data.intents[0].intent,
            text: data.output.text[0]
        } );        
        
        // Clean up
        xhr.removeEventListener( 'load', doIntentLoad );
        xhr = null;    
    };
    
    // Debug
    console.log( 'Conversation' );
    
    // Pointers
    return {
        INTENT: 'tts_intent',
        
        dialog: dialog,
        on: on
    };
    
} )();
