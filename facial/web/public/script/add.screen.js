class AddScreen extends Observer {
  constructor() {
    // Inherit
    super();

    // Event listener for next button
    // Reference to be able to add and remove
    this.doForwardClick = this.doForwardClick.bind( this );

    // Element references
    // Event handlers where needed
    this.root = document.querySelector( 'div.screen:nth-of-type( 2 )' );
    this.name = document.querySelector( 'div.screen:nth-of-type( 2 ) > input' );    
    this.name.addEventListener( 'keyup', ( evt ) => this.doNameChange( evt ) );
    this.cancel = document.querySelector( 'div.screen:nth-of-type( 2 ) > div.controls > button.cancel' );
    this.cancel.addEventListener( 'click', ( evt ) => this.doCancelClick( evt ) );
    this.forward = document.querySelector( 'div.screen:nth-of-type( 2 ) > div.controls > button.forward' );    
  }

  // Get the class name provided
  getName() {
    return this.name.value.trim();
  }

  // Set the class name
  setName( value ) {
    this.name.value = value;
  }

  // Clear the screen
  clear() {
    this.name.value = '';
  }

  // Hide the screen
  hide() {
    this.root.style.display = 'none';
  }

  // Show the screen
  show() {
    this.root.style.display = 'flex';
  }  

  // Click to advance to next screen
  doForwardClick( evt ) {
    this.emit( AddScreen.EVENT_FORWARD, null );
  }

  // Class name input value has changed
  doNameChange( evt ) {
    // Make sure there is content
    if( this.name.value.trim().length > 0 ) {
      // There is content so enable next button
      this.forward.classList.remove( 'disabled' );
      this.forward.addEventListener( 'click', this.doForwardClick );

      // Also handle enter key for convenience
      if( evt.keyCode === 13 ) {
        this.emit( AddScreen.EVENT_FORWARD, null );
      }
    } else {
      // No name provided
      // Block moving to next step
      this.forward.classList.add( 'disabled' );
      this.forward.removeEventListener( 'click', this.doForwardClick );      
    }
  }

  // Cancel process of adding class
  doCancelClick( evt ) {
    this.emit( AddScreen.EVENT_CANCEL, null );
  }
}

// Constants
AddScreen.EVENT_CANCEL = 'add_cancel_click';
AddScreen.EVENT_FORWARD = 'add_forward_click';
