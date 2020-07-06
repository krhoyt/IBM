var Tone = ( function() {

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
    
    // Send textual content for tone analysis
    var analyze = function( content ) {
        // Debug
        console.log( 'Analyzing tone ...' );
        
        // Send content to Watson
        xhr = new XMLHttpRequest();
        xhr.addEventListener( 'load', doAnalyzeLoad );
        xhr.open( 'POST', SERVER_PATH + 'tone/analyze' );
        xhr.setRequestHeader( 'Content-Type', 'application/json' );
        xhr.send( JSON.stringify( {
            content: content    
        } ) );        
    };
    
    // Response from Tone Analysis
    var doAnalyzeLoad = function() {
        var data = null;
        var tones = null;
        
        // Parse JSON
        data = JSON.parse( xhr.responseText );
        
        // Debug
        console.log( data );
        
        // Sort
        data.document_tone.tone_categories[0].tones = 
        data.document_tone.tone_categories[0].tones.sort( function( a, b ) {
            if( a.score < b.score ) {
                return 1;
            } else if( a.score > b.score ) {
                return -1;
            } else {
                return 0;
            }
        } );
        
        // Emit event with results
        // Subset of total response
        emit( 
            Tone.COMPLETE, 
            data.document_tone.tone_categories[0].tones 
        );
        
        // Clean up
        xhr.removeEventListener( 'load', doAnalyzeLoad );
        xhr = null;
    };        
    
    var getThreshold = function() {
        return threshold;
    };
    
    var setThreshold = function( value ) {
        threshold = value;    
    };    
    
    // Debug
    console.log( 'Tone Analyzer' );
    
    // Default threshold
    // setThreshold( 0.50 );    
    setThreshold( 0 );    
    
    // Pointers
    return {
        COMPLETE: 'tone_complete',
        
        getThreshold: getThreshold,
        setThreshold: setThreshold,        
        
        on: on,
        analyze: analyze
    };

} )();
