var Translate = ( function() {

    var ENGLISH = 'en';
    var SPANISH = 'es';
    
    // Private
    var source = null;
    var subscribers = null;
    var target = null;
    var voices = null;
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
        
    // Get translated content
    var translate = function( content, target ) {
        // Debug
        console.log( 'Requesting translation ...' );
        
        // Request translation
        xhr = new XMLHttpRequest();
        xhr.addEventListener( 'load', doTranslateLoad );
        xhr.open( 'POST', SERVER_PATH + 'translate/to', true );
        xhr.setRequestHeader( 'Content-Type', 'application/json' );            
        xhr.send( JSON.stringify( {
            source: getSource(),
            target: getTarget(),
            text: content
        } ) );
    };
    
    var doTranslateLoad = function() {
        var data = null;
        
        // Parse JSON response        
        data = JSON.parse( xhr.responseText );
        
        // Sampling of translation data
        console.log( data );
        console.log( data.translations[0].translation );
        
        emit( Translate.COMPLETE, {
            translation: data.translations[0].translation
        } );
        
        // Clean up
        xhr.removeEventListener( 'load', doTranslateLoad );
        xhr = null;
    };

    var doVoicesLoad = function() {
        // Parse JSON
        voices = JSON.parse( xhr.responseText );
        
        // Debug
        console.log( voices );
        
        // Clean up
        xhr.removeEventListener( 'load', doVoicesLoad );
        xhr = null;
    };
    
    // Get identifiable languages
    var getLanguages = function() {
        return voices;
    }
    
    // Get source language
    var getSource = function() {
        return source;
    }

    // Set source language
    var setSource = function( newSource ) {
        source = newSource;
    }
    
    // Get target language
    var getTarget = function() {
        return target;
    }

    // Set target language
    var setTarget = function( newTarget ) {
        target = newTarget;
    }    
    
    // Debug
    console.log( 'Translate' );
    
    // Set default values
    setSource( ENGLISH );
    setTarget( SPANISH );
    
    // Get the possible languages
    xhr = new XMLHttpRequest();
    xhr.addEventListener( 'load', doVoicesLoad );
    xhr.open( 'GET', SERVER_PATH + 'translate/languages', true );
    xhr.send( null );
    
    // Pointers
    return {
        COMPLETE: 'translate_complete',        
        IDENTIFY: 'translate_identify',
        
        ENGLISH: ENGLISH,
        SPANISH: SPANISH,
    
        getLanguages: getLanguages,        
        getSource: getSource,
        setSource: setSource,
        getTarget: getTarget,
        setTarget: setTarget,        
        
        on: on,
        to: translate
    };
    
} )();
