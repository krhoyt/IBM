var STT = ( function() {
    
    // Private
    var source = null;
    var subscribers = null;    
    var transcript = null;    
    var watson = null;    
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
    
    // Transcribe an audio file
    // Store reference to provided object
    // Start transcription process
    var file = function( object ) {
        // Debug
        console.log( 'Using audio file.' );
        
        // Store reference to file
        source = object;
        
        // Start transcription
        transcribe();
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
    
    // Start communicating to Watson
    // First step in a chain
    // Get authentication token
    var transcribe = function() {
        // Debug
        console.log( 'Requesting token ...' );

        // Get token
        xhr = new XMLHttpRequest();
        xhr.addEventListener( 'load', doTokenLoad );
        xhr.open( 'GET', SERVER_PATH + 'stt/token', true );
        xhr.send( null );    			            
    };
    
    // Token retrieved
    var doTokenLoad = function() {
        // Debug
        console.log( 'Token retrieved.' );
        
        // Let UI know we have a token
        emit( STT.TOKEN, null );
        
        /*
         * TODO: Send content to Watson
         */
        // Start stream to Watson
        // Either microphone or local file
        if( source == null ) {
            watson = WatsonSpeech.SpeechToText.recognizeMicrophone( {
                continuous: false,
                objectMode: true,
                token: xhr.responseText
            } );            
        } else {
            watson = WatsonSpeech.SpeechToText.recognizeFile( {
                file: source,
                token: xhr.responseText
            } );
        }        
        
        /*
         * TODO: Transcription events
         */
        // Transcription events
        watson.on( 'data', doWatsonData );
        watson.on( 'error', doWatsonError );
        watson.on( 'end', doWatsonEnd );                
        
        // Clean up
        xhr.removeEventListener( 'load', doTokenLoad );
        xhr = null;        
    };
    
    // Transcription from Watson    
    var doWatsonData = function( data ) {
        // Debug
        console.log( data );
        
        /*
         * TODO: Store transcript
         */
        // Track changes to transcript
        if( source == null ) {
            // Copy full object
            transcript = Object.assign( {}, data );

            // Display current
            emit( STT.PROGRESS, {
                transcript: transcript.results[0].alternatives[transcript.result_index].transcript    
            } );
        } else {
            // Just a string
            transcript = data;
        }        
    };
    
    // Stream ended
    // Good place for follow-up actions    
    var doWatsonEnd = function() {
        // Debug
        console.log( 'Stream ended.' );    
        
        /*
         * TODO: Finalize transcript
         */
        // Isolate result by source
        // Just want raw text at this point
        if( source == null ) {
            transcript = transcript.results[0].alternatives[transcript.result_index].transcript;
        }        

        // Tell UI final results
        emit( STT.TRANSCRIBE, {
            type: source == null ? 'microphone' : 'file',
            transcript: transcript    
        } );
        
        // Clean up
        source = null;        
    };
    
    // Fail
    var doWatsonError = function( err ) {
        // Debug
        console.log( 'Watson error.' );
        console.log( err );
    };
    
    // Debug
    console.log( 'Speech-To-Text' );
    
    // Reveal pointers
    return {
        PROGRESS: 'stt_progress',
        TOKEN: 'stt_token',
        TRANSCRIBE: 'stt_transcribe',
        
        file: file,
        microphone: transcribe,
        on: on,
        transcribe: transcribe
    };
    
} )();
