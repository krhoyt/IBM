class Folder extends Observer {
  constructor() {
    super();

    // Root
    this.root = document.querySelector( '#folder' );

    // Cancel
    this.cancel = this.root.querySelector( '.header > button:first-of-type' );
    this.cancel.addEventListener( 'touchstart', ( evt ) => this.doCancelTouch( evt ) );

    // Save
    this.save = this.root.querySelector( '.header > button:last-of-type' );
    this.save.addEventListener( 'touchstart', ( evt ) => this.doSaveTouch( evt ) );

    // Input field
    // Name of folder
    this.field = this.root.querySelector( 'input' );
    this.field.addEventListener( 'keyup', ( evt ) => this.doFieldKey( evt ) );
  }

  hide() {
    // Will be at top of
    // Move off bottom of screen
    // Inline with iOS behaviors
    this.root.style.top = window.innerHeight + 'px';

    // Clear input field when hidden
    setTimeout( () => {
      this.field.value = '';
    }, 1000 * Folder.ANIMATION_DURATION );
  }

  show() {
    // Will be off bottom of screen
    // Move to top of screen
    // Inline with iOS behaviors
    this.root.style.top = 0;
  }

  doCancelTouch( evt ) {
    // Hide screen
    this.hide();

    this.emit( Folder.EVENT_CANCEL, null );
  }

  doFieldKey( evt ) {
    let valid = false;

    // Is there some value in the input field
    if( this.field.value.trim().length > 0 ) {
      // Must not have spaces
      if( this.field.value.trim().indexOf( ' ' ) == -1 ) {
        valid = true;
      }
    }
      
    // Validated (weakly)
    // Disable or enable save button
    if( valid == true ) {
      this.save.style.visibility = 'visible';
    } else {
      this.save.style.visibility = 'hidden';
    }    
  }

  doSaveTouch( evt ) {
    this.emit( Folder.EVENT_SAVE, {
      // Force lowercase per COS requirements
      name: this.field.value.toLowerCase().trim()
    } );
  }
}

// Constants
Folder.ANIMATION_DURATION = 0.80;
Folder.EVENT_SAVE = 'add_event_save';
Folder.EVENT_CANCEL = 'add_event_cancel';
