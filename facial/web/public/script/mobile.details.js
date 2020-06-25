class DetailScreen extends Screen {
  constructor() {
    super( document.querySelector( '#detail' ) );
    
    // Image from class
    // Name of class
    this.image = this.root.querySelector( 'img' );
    this.name = this.root.querySelector( 'p' );

    // Back
    this.back = this.root.querySelector( '.back' );
    this.back.addEventListener( 'touchstart', ( evt ) => this.doBackDown( evt ) );

    // Remove class
    this.remove = this.root.querySelector( '.remove' );
    this.remove.addEventListener( 'touchstart', ( evt ) => this.doRemoveDown( evt ) );
  }

  // Get screen data
  get data() {
    return {
      name: this.root.getAttribute( 'data-name' ),
      image: this.root.getAttribute( 'data-image' )
    };
  }

  // Set screen data
  // Preferencial to data attributes
  set data( value ) {
    this.root.setAttribute( 'data-name', value.name );
    this.name.innerHTML = value.name;

    this.root.setAttribute( 'data-image', value.image );
    this.image.src = `../classifier/${value.name}/${value.image}`;
  }

  // Done viewing
  doBackDown( evt ) {
    this.emit( DetailScreen.EVENT_BACK, this.data );
  }

  // Want to remove
  // TODO: Confirm?
  doRemoveDown( evt ) {
    // Call to remove from server file system
    fetch( `/api/storage/class/${this.data.name}`, {
      method: 'DELETE'
    } ).then( ( response ) => {return response.json();} )
    .then( ( data ) => {
      this.emit( DetailScreen.EVENT_REMOVE, data );
    } );
  }
}

// Constants
DetailScreen.EVENT_BACK = 'detail_back';
DetailScreen.EVENT_REMOVE = 'detail_remove';
