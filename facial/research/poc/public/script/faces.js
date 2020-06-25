var Faces = ( function( selector ) {

  // Constants
  var FACE_SAVED = 'face_saved';
  var PERSON_TEMPLATE = '.faces.person.template';

  // Properties
  var card = null;
  var count = null;
  var detect = null;
  var element = null;
  var header = null;
  var subscribers = null;

  /*
   * Methods
   */

  // Called to rebuild detected faces list
  // Clears existing content
  // Rebuilds from scratch
  var buildList = function() {
    var avatar = null;
    var clone = null;
    var content = null;
    var label = null;
    var list = null;
    var template = null;    

    // Clear existing elements
    // Complete rebuild of list
    clearList();

    // Build list
    for( var f = 0; f < detect.images[0].faces.length; f++ ) {
      // Expanded to show card details
      if( detect.images[0].faces[f].expanded ) {    
        // Build card element
        // Logical container for data
        card = new Card( detect.images[0].faces[f] );

        // Listen for edits
        card.addEventListener( card.CARD_CANCEL, doCardCancel );
        card.addEventListener( card.CARD_SAVE, doCardSave );

        // Index maps to dataset
        card.setIndex( f );

        // Append to panel
        // Not append to list
        // Lists are for groups of person elements
        element.appendChild( card.getElement() );

        // Not inside a list
        list = null;
      } else {
        // Person elements inside list elements
        // Grouping for rounded corners effect
        if( list == null ) {
          list = document.createElement( 'div' );
          list.classList.add( 'list' );
          element.appendChild( list );
        }

        // Initially collapsed
        detect.images[0].faces[f].expanded = false;

        // Property value is entirely uppercase
        // Styling will capitalize as necessary
        label = detect.images[0].faces[f].gender.gender.toLowerCase() + ', ';

        // Account for absences of minimum age
        if( detect.images[0].faces[f].age.min ) {
          label = label + detect.images[0].faces[f].age.min + '-';
        }

        label = label + detect.images[0].faces[f].age.max;

        // Clone person element
        template = document.querySelector( PERSON_TEMPLATE );

        // Populate cloned person element
        clone = template.cloneNode( true );
        clone.setAttribute( 'data-index', f );
        clone.classList.remove( 'faces' );
        clone.classList.remove( 'template' );
        clone.addEventListener( 'click', doFaceClick );

        // Set person avatar
        avatar = clone.querySelector( '.avatar' );
        avatar.style.backgroundImage = 'url( ' + detect.images[0].faces[f].avatar + ' )';

        // Set person label
        content = clone.querySelector( '.content' );
        content.innerHTML = label;

        // Append to list
        // Person elements grouped in lists
        // For rounded corner effect
        list.appendChild( clone );
      }
    }
  };

  // Called to clear detected faces
  var clearList = function() {
    while( element.children.length > 1 ) {
      if( element.children[element.children.length - 1].classList.contains( 'list') ) {
        // Clean up
        // Remove existing event listeners
        for( var p = 0; p < element.children.length; p++ ) {
          element.children[p].removeEventListener( 'click', doFaceClick );
        }

        // Remove list element
        element.children[element.children.length - 1].remove();        
      }
       
      // Remove card element
      if( element.children[element.children.length - 1].classList.contains( 'card' ) ) {
        element.children[element.children.length - 1].remove();
      }
    }

    // Holder for person specific data
    card = null;
  };

  // Called to set dectected faces
  // Builds list around faces
  var setData = function( data ) {
    // Debug
    console.log( 'Set faces.' );

    // Ad hoc clone
    detect = JSON.parse( JSON.stringify( data ) );

    // Header information display
    count.innerHTML = data.images[0].faces.length;

    // Make sure panel is visial
    element.style.visibility = 'visible';

    // Rebuild list
    buildList();
  };

  /*
   * Observer
   */

  // Called by observers to add event notifications
  var addEventListener = function( name, callback ) {
    if( subscribers == null ) {
      subscribers = [];
    }
    
    // Track observers
    // Events they want
    // Callbacks to trigger    
    subscribers.push( {
      callback: callback,
      name: name
    } );
  };

  // Called to send a notification event
  // Listeners for event get specified data
  var emit = function( name, data ) {
    for( var s = 0; s < subscribers.length; s++ ) {
      if( subscribers[s].name == name ) {
        subscribers[s].callback( data );
      }
    }
  };    

  /*
   * Events
   */

  // Called when face edit is cancelled
  // Removes card and rebuilds list
  var doCardCancel = function( index ) {
    // Debug
    console.log( 'Cancel card.' );
    console.log( 'Index: ' + index );

    // Clear card
    detect.images[0].faces[index].expanded = false;

    // Rebuild the list
    buildList();
  };

  // Called when a card is saved
  // Commits changes to dataset
  // Rebuilds list
  var doCardSave = function( data ) {
    // Debug
    console.log( 'Save card.' );
    console.log( data );

    // Update data set
    detect.images[0].faces[data.index].first = data.first;
    detect.images[0].faces[data.index].last = data.last;
    detect.images[0].faces[data.index].expanded = false;

    // Make sure to pull image over
    // Used for persistance on the server
    detect.images[0].faces[data.index].image = detect.images[0].image;
    detect.images[0].faces[data.index].hash = detect.images[0].hash;

    // Send on to commit to database
    emit( FACE_SAVED, detect.images[0].faces[data.index] );

    // Remove record as committed
    detect.images[0].faces.splice( data.index, 1 );

    // Update display
    if( detect.images[0].faces.length == 0 ) {
      // Clean up previous list build
      clearList();

      // Hide panel
      element.style.visibility = 'hidden';
    } else {
      // Update count display
      count.innerHTML = detect.images[0].faces.length;

      // Rebuild list
      buildList();          
    }
  };

  // Called when a person element is clicked
  // Sets that person element to show expeanded details
  // Rebuilds dectected faces list
  var doFaceClick = function() {
    var index = null;

    // Debug
    console.log( 'Face clicked.' );

    // Collapse any previously expanded element
    // Only one editable card element at a time
    for( var f = 0; f < detect.images[0].faces.length; f++ ) {
      if( detect.images[0].faces[f].expanded ) {
        detect.images[0].faces[f].expanded = false;
        break;
      }
    }

    // Record element relation to dected dataset
    index = parseInt( this.getAttribute( 'data-index' ) );
    detect.images[0].faces[index].expanded = true;

    // Debug
    console.log( detect.images[0].faces[index] );

    // Rebuild list
    buildList();
  };

  /*
   * Initialize
   */

  // Class name
  console.log( 'Faces.' );

  // References as necessary
  element = document.querySelector( selector );
  header = element.querySelector( 'header' );
  count = element.querySelector( 'header > p:nth-of-type( 2 )' );

  // Reveal
  return {
    FACE_SAVED: FACE_SAVED,
    addEventListener: addEventListener,
    setData: setData
  };

} );
