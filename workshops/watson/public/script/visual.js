var Visual = ( function() {

    // Private
    var subscribers = null;
    var xhr = null;
    
    // Clean uploads
    // Delete all uploaded files
    var clean = function() {
        // Debug
        console.log( 'Cleaning ...' );
        
        // Tell server to clean up
        xhr = new XMLHttpRequest();
        xhr.addEventListener( 'load', doCleanLoad );
        xhr.open( 'DELETE', SERVER_PATH + 'visual/clean', true );
        xhr.send( null );
    };    
    
    // Sort faces by confidence
    var compare = function( a, b ) {
        if( a.identity.score < b.identity.score ) {
            return 1;
        }
        
        if( a.identity.score > b.identity.score ) {
            return -1;
        }        
        
        return 0;
    };
    
    // Detect faces in an image
    var detect = function( object ) {
        var form = null;
        
        // Debug
        console.log( 'Uploading file ... (detect)' );
        
        // Build multipart form
        form = new FormData();
        form.append( 'attachment', object );
        
        // Submit form for processing
        xhr = new XMLHttpRequest();
        xhr.addEventListener( 'load', doDetectLoad );
        xhr.open( 'POST', SERVER_PATH + 'visual/detect' );
        xhr.send( form );        
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
    
    var read = function( object ) {
      Tesseract.recognize( object, {
          lang: 'eng'
        } )
        .then( function( result ) {
          var words = null;
          
          // Debug
          console.log( result );

          // Isolate key words
          words = [];
        
          for( var w = 0; w < result.words.length; w++ ) {
            if( result.words[w].confidence > 80 ) {
              words.push( {
                text: result.words[w].text.toLowerCase(),
                confidence: result.words[w].confidence
              } );
            }
          }
        
          // Sort by confidence
          words.sort( function( a, b ) {
            if( a.confidence > b.confidence ) {
              return 1;
            } else if( a.confidence < b.confidence ) {
              return -1;
            }
            
            return 0;
          } );
        
          // Emit event with results
          emit( Visual.READ, {
              words: words
          } );        
        } );
    };
  
    // Use Visual Recognition on an image file
    var recognize = function( object ) {
        var form = null;
        
        // Debug
        console.log( 'Uploading file ... (recognize)' );
        
        // Build multipart form
        form = new FormData();
        form.append( 'attachment', object );
        
        // Submit form for processing
        xhr = new XMLHttpRequest();
        xhr.addEventListener( 'load', doRecognizeLoad );
        xhr.open( 'POST', SERVER_PATH + 'visual/recognition' );
        xhr.send( form );        
    };
    
    // Called when uploads have been removed
    var doCleanLoad = function() {
        // Debug
        console.log( 'Done.' );        
    };    
    
    var doDetectLoad = function() {
        var data = null;
        var faces = null;
        
        // Parse JSON
        data = JSON.parse( xhr.responseText );    
      
        // Raw data
        console.log( data );
        
        // Watson knows this person
        if( data.images[0].faces[0].identity ) {
            data.images[0].faces.sort( compare );            
        }
        
        // Prepare result
        faces = [];
        
        for( var f = 0; f < data.images[0].faces.length; f++ ) {
            if( data.images[0].faces[f].identity ) {
                faces.push( data.images[0].faces[f].identity.name );                
            } else {
                faces.push( 
                    'a ' + 
                    data.images[0].faces[f].age.min + '-year-old ' + 
                    data.images[0].faces[f].gender.gender.toLowerCase()
                );    
            }
        }
        
        // Emit event with results
        emit( Visual.DETECT, {
            faces: faces
        } );        
        
        // Clean up
        xhr.removeEventListener( 'load', doDetectLoad );
        xhr = null;
    };
    
    // Response from Visual Recognition
    var doRecognizeLoad = function() {
        var classifiers = null;
        var data = null;
        
        // Parse JSON
        data = JSON.parse( xhr.responseText );
        
        // Sampling of classifier results
        console.log( data );
        console.log( data.images[0].classifiers[0].classes[0].class );        
        
        // Prepare result
        classifiers = [];
        
        // Aggregate classifiers
        for( var c = 0; c < data.images[0].classifiers[0].classes.length; c++ ) {
            classifiers.push( data.images[0].classifiers[0].classes[c].class ); 
        }
        
        // Emit event with results
        emit( Visual.RECOGNIZE, {
            subject: data.images[0].classifiers[0].classes[0].class,
            classifiers: classifiers
        } );
        
        // Clean up
        xhr.removeEventListener( 'load', doRecognizeLoad );
        xhr = null;
    };
    
    // Debug
    console.log( 'Visual Recognition' );
    
    // Pointers
    return {
        DETECT: 'visual_detect',
        RECOGNIZE: 'visual_recognize',
        READ: 'visual_read',
        
        clean: clean,
        detect: detect,
        on: on,
        read: read,
        recognize: recognize,
        reset: clean
    };

} )();
