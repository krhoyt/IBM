var Alchemy = ( function() {

    // Private
    var subscribers = null;
    var threshold = null;
    var xhr = null;
    
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
    
    // Apply Alchemy Language on URL
    var language = function( url ) {
        // Debug
        console.log( 'Sending URL ...' );
        
        // Submit URL for processing
        xhr = new XMLHttpRequest();
        xhr.addEventListener( 'load', doLanguageLoad );
        xhr.open( 'POST', SERVER_PATH + 'alchemy/language' );
        xhr.setRequestHeader( 'Content-Type', 'application/json' );                    
        xhr.send( JSON.stringify( {
            url: url
        } ) );        
    };
    
    // Response from Alchemy Language
    var doLanguageLoad = function() {
        var concepts = null;        
        var data = null;
        
        // Parse JSON
        data = JSON.parse( xhr.responseText );
        
        // Debug
        // NLP FTW
        console.log( data );
        
        // Prepare result
        concepts = [];    
        
        // Aggregate concepts
        for( var c = 0; c < data.concepts.length; c++ ) {
            if( data.concepts[c].relevance >= getThreshold() ) {
                concepts.push( data.concepts[c].text );
            }
        }
        
        // Emit event with results
        emit( Alchemy.COMPLETE, {
            concepts
        } );
        
        // Clean up
        xhr.removeEventListener( 'load', doLanguageLoad );
        xhr = null;
    };
    
    var getThreshold = function() {
        return threshold;
    };
    
    var setThreshold = function( value ) {
        threshold = value;    
    };
    
    // Debug
    console.log( 'Alchemy Language' );
    
    // Default threshold
    // setThreshold( 0.75 );    
    setThreshold( 0 );
    
    // Pointers
    return {
        COMPLETE: 'alchemy_complete',
        
        getThreshold: getThreshold,
        setThreshold: setThreshold,
        
        on: on,
        language: language
    };

} )();
