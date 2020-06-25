class NameScreen extends Screen {
  constructor() {
    super( document.querySelector( '#name' ) );

    // Event listener for next button
    // Reference to be able to add and remove
    this.doForwardDown = this.doForwardDown.bind( this );

    // Name for class
    this.input = this.root.querySelector( 'input' );
    this.input.addEventListener( 'keyup', ( evt ) => this.doInputChange( evt ) );    
    
    // No new class
    this.back = this.root.querySelector( 'button.back' );
    this.back.addEventListener( 'touchstart', ( evt ) => this.doBackDown( evt ) );

    // Name supplied
    // Keep building class
    this.forward = this.root.querySelector( 'button.next' );
  }

  // Get screen data
  get data() {
    return this.input.value.trim();
  }

  // Set screen data
  set data( value ) {
    this.input.value = value.trim();
  }

  // Clear screen from previous
  clear() {
    this.data = '';
    
    this.forward.removeEventListener( 'click', this.doForwardDown );      
    this.forward.classList.add( 'disabled' );
  }

  // Do not want a new class
  doBackDown( evt ) {
    this.emit( NameScreen.EVENT_BACK, null );
  }

  // Keep moving forward
  doForwardDown( evt ) {
    // TODO: Get more aggressive on hiding keyboard
    this.input.blur();
    
    this.emit( NameScreen.EVENT_NEXT, {
      name: this.data
    } );
  }

  // Cannot move forward without class name
  doInputChange( evt ) {
    // Make sure there is content
    if( this.data.length > 0 ) {
      // There is content so enable next button
      this.forward.classList.remove( 'disabled' );
      this.forward.addEventListener( 'touchstart', this.doForwardDown );

      // Also handle enter key for convenience
      if( evt.keyCode === 13 ) {
        this.emit( NameScreen.EVENT_NEXT, {
          name: this.data
        } );
      }
    } else {
      // No name provided
      // Block moving to next step
      this.forward.classList.add( 'disabled' );
      this.forward.removeEventListener( 'click', this.doForwardDown );      
    }    
  }
}

// Constants
NameScreen.EVENT_BACK = 'name_back';
NameScreen.EVENT_NEXT = 'name_next';
