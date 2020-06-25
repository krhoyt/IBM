var Card = ( function( data ) {

  // Constants
  var CARD_CANCEL = 'card_cancel';
  var CARD_SAVE = 'card_save';  
  var CARD_TEMPLATE = '.faces.card.template';

  // Properties
  var avatar = null;
  var cancel = null;
	var element = null;
  var first = null;
  var index = null;
  var last = null;
  var save = null;  
  var subscribers = null;
  var template = null;

  /*
   * Methods
   */

  // ?

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

  // Called to cancel an edit
  // Will ultimately remove card
  // Rerender list
  var doCancel = function() {
    emit( CARD_CANCEL, index );
  };

  // Called to save an edit
  // Will ultimately remove card
  // Rerender list
  var doSave = function() {
    // Only if required field is filled
    if( first.getValue().length > 0 ) {
      // TODO: Keep empty fields undefined
      emit( CARD_SAVE, {
        index: index,
        first: first.getValue(),
        last: last.getValue()
      } );
    }
  };

  /*
   * Access methods 
   */ 

  // Called to get root element node
  // Used to append dynamically to list
  var getElement = function() {
    return element;
  };

  // External reference for dataset
  // Kinda ugly
  // Need refactoring
  var getIndex = function() {
    return index;
  };

  var setIndex = function( i ) {
    index = i;
  };

  /*
   * Initialize
   */

  // Class name
	console.log( 'Card.' );
	
  // Build from template
  template = document.querySelector( CARD_TEMPLATE );

  // Adjust styles for display
  element = template.cloneNode( true );
  element.classList.remove( 'faces' );
  element.classList.remove( 'template' );

  // Set card avatar
  avatar = element.querySelector( '.person > .avatar' );
  avatar.style.backgroundImage = 'url( ' + data.avatar + ' )';

  // Fields
  first = new Field( element.querySelectorAll( '.field' )[0] );

  // Set value if existing
  if( data.first ) {
    first.setValue( data.first );
  }

  last = new Field( element.querySelectorAll( '.field' )[1] );

  // Set value if existing
  if( data.last ) {
    last.setValue( data.last );
  }

  // Buttons
  cancel = element.querySelector( '.sheet > button:first-of-type' );
  cancel.addEventListener( 'click', doCancel );

  save = element.querySelector( '.sheet > button:last-of-type' );
  save.addEventListener( 'click', doSave );

  // Reveal
	return {
    CARD_CANCEL: CARD_CANCEL,
    CARD_SAVE: CARD_SAVE,
    addEventListener: addEventListener,
    getElement: getElement,
    getIndex: getIndex,
    setIndex: setIndex
	};

} );
