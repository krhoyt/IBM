class Menu extends Observer {
  constructor( path ) {
    super();

    // Root
    this.root = document.querySelector( path );

    // Button group
    // Created to menu
    // Allows animation indepedent of screen
    this.group = document.createElement( 'div' );

    // Move pre-populated buttons to group
    while( this.root.children.length > 0 ) {
      // If they are buttons
      // Disregard block element
      if( this.root.children[0].tagName == 'BUTTON' ) {
        this.root.children[0].addEventListener( 'touchstart', ( evt ) => this.doButtonTouch( evt ) );
      }

      // Move button from root to group
      this.group.appendChild( this.root.children[0] );
    }

    // Block element
    // Background for menu
    // Can be controlled independently of screen
    this.block = document.createElement( 'div' );
    this.root.appendChild( this.block );

    // Put button group on root
    // After block so that it is on top
    this.root.appendChild( this.group );

    // Place off the screen
    this.group.style.bottom = ( 0 - this.group.clientHeight ) + 'px';    

    // Details of selected item
    this.name = this.group.querySelector( 'div > p:first-of-type' );
    this.details = this.group.querySelector( 'div > p:last-of-type' );
  }

  hide() {
    // Block will be opaque
    // Make transparent
    // Button group will be on screen
    // Move off bottom of screen
    // Inline with iOS behaviors
    this.block.style.opacity = 0;
    this.group.style.bottom = ( 0 - this.group.clientHeight ) + 'px';
    
    // Hide menu when animation is complete
    setTimeout( () => {
      this.root.style.visibility = 'hidden';  
    }, 1000 * Menu.ANIMATION_DURATION );
  }

  show() {
    // Make screen visible
    // Block will be transparent
    // Make opaque
    // Group will be off bottom of screen
    // Move onto screen from bottom
    // Inline with iOS behaviors
    this.root.style.visibility = 'visible';
    this.block.style.opacity = 1;
    this.group.style.bottom = 0;
  }

  getDetails() {
    // Get item details from attributes
    return {
      modified: this.root.getAttribute( 'data-modified' ),
      name: this.root.getAttribute( 'data-name' ),
      size: this.root.getAttribute( 'data-size' ),
      type: this.root.getAttribute( 'data-type' )
    };
  }

  setDetails( details ) {
    // Put item details into attributes
    this.root.setAttribute( 'data-modified', details.modified );
    this.root.setAttribute( 'data-name', details.name );
    this.root.setAttribute( 'data-type', details.type );

    // Display details
    this.name.innerHTML = details.name;

    // Parse and format details for display
    const parsed = new Date( details.modified );
    const created = moment( parsed );
    const dated = created.format( 'MMM D, YYYY' );

    // Size not available for buckets
    // Use time in place of size
    // TODO: Make size available for buckets
    if( details.size ) {
      const sized = Storage.formatBytes( parseInt( details.size ) );      

      this.root.setAttribute( 'data-size', details.size );    
      this.details.innerHTML = `${dated} &bull; ${sized}`;      
    } else {
      const timed = created.format( 'h:mm A' );      
      this.details.innerHTML = `${dated} at ${timed}`;            
    }
  }

  doButtonTouch( evt ) {
    // Get the label of the button that was touched
    // Attempts to keep button specifics out of class
    const label = evt.target.getAttribute( 'data-label' );

    // Hide if cancel
    if( label == Menu.LABEL_CANCEL ) {
      this.hide();
    } else {
      // Do something else if another button
      this.emit( Menu.EVENT_BUTTON, {
        label: label,
        details: this.getDetails()
      } );
    }
  }
}

// Constants
Menu.ANIMATION_DURATION = 0.60;
Menu.LABEL_CANCEL = 'cancel';
Menu.LABEL_DELETE = 'delete'
Menu.LABEL_SAVE = 'save';
Menu.EVENT_BUTTON = 'menu_event_button';
