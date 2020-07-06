var Personality = ( function() {

    // Private
    var subscribers = null;
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
    
    // Call to send text content to Personality Insights
    var insights = function( content ) {
        // Debug
        console.log( 'Personality insight ...' );        
        
        // Send content to Watson
        xhr = new XMLHttpRequest();
        xhr.addEventListener( 'load', doInsightsLoad );
        xhr.open( 'POST', SERVER_PATH + 'personality/insights' );
        xhr.setRequestHeader( 'Content-Type', 'application/json' );
        xhr.send( JSON.stringify( {
            content: content    
        } ) );                
    };
    
    // Response from Personality Insights
    var doInsightsLoad = function() {
        var data = null;
        var needs = null;
        var tree = null;
        
        // Parse JSON
        data = JSON.parse( xhr.responseText );
        
        // Debug
        console.log( data );
        
        needs = [];
        
        // Look for the needs part of the tree
        for( var t = 0; t < data.tree.children.length; t++ ) {
            if( data.tree.children[t].id == "needs" ) {                
                // Abbreviate node traversal
                tree = data.tree.children[t].children[0].children;
                
                // Sort node by percentage
                tree = tree.sort( function( a, b ) {
                    var result = 0;
                    
                    if( a.percentage > b.percentage ) {
                        result = -1;
                    } else if( a.percentage < b.percentage ) {
                        result = 1;
                    }
                    
                    return result;
                } );                
                
                // Aggregate needs
                for( var n = 0; n < tree.length; n++ ) {
                    needs.push( {
                        name: tree[n].name,
                        score: tree[n].percentage
                    } );
                }
                
                break;
            }
        }
        
        // Emit event with results
        emit( Personality.COMPLETE, {
            needs
        } );
        
        // Clean up
        xhr.removeEventListener( 'load', doInsightsLoad );
        xhr = null;        
    }
    
    // Debug
    console.log( 'Personality' );
    
    // Reveal
    return {
        COMPLETE: 'personality_complete',        
        
        insights: insights,
        on: on
    };
    
} )();
