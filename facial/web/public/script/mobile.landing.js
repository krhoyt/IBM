class LandingScreen extends Screen {
  constructor() {
    super( document.querySelector( '#landing' ) );

    // List and add button
    // TODO: Implement build (waiting for Watson APIs to settle)
    this.list = this.root.querySelector( '.list' );
    this.add = this.list.querySelector( '.face' );
    this.add.children[0].id = 'action';
    this.add.addEventListener( 'touchstart', ( evt ) => this.doAddDown( evt ) );    

    this.root.style.left = 0;
  }

  // Get screen data
  get data() {
    let result = {};

    // From list
    for( let c = 0; c < this.list.children.length; c++ ) {
      result[this.list.children[c].getAttribute( 'data-name' )] = this.list.children[c].getAttribute( 'data-image' );
    }

    return result;
  }

  // Set screen data
  set data( faces ) {
    for( let face in faces ) {
      // Build list
      this.append( face, faces[face] );
    }
  }

  // Build list item
  append( name, image ) {
    let clone = this.add.cloneNode( true );      
    clone.classList.remove( 'template' );
    clone.children[0].id = null;
    clone.children[0].style.backgroundImage = 'url( ../classifier/' + name + '/' + image + ' )';
    clone.setAttribute( 'data-name', name );
    clone.setAttribute( 'data-image', image );
    clone.addEventListener( 'touchstart', ( evt ) => this.doViewDown( evt ) );
    this.list.insertBefore( clone, this.add );    
  }

  // Clear the list
  // Leaves the add button
  clear() {
    while( this.list.children.length > 1 ) {
      this.list.children[0].remove();
    }
  }

  // Remove specific item from list
  // TODO: Remove event listeners
  remove( name ) {
    let item = this.list.querySelector( `div[data-name="${name}"]` );
    item.remove();
  }

  // Add a class
  doAddDown( evt ) {
    this.emit( LandingScreen.EVENT_ADD, null );
  }

  // View a class
  doViewDown( evt ) {
    this.emit( LandingScreen.EVENT_VIEW, {
      name: evt.target.parentElement.getAttribute( 'data-name' ),
      image: evt.target.parentElement.getAttribute( 'data-image' )
    } );
  }
}

// Constants
LandingScreen.EVENT_ADD = 'main_add';
LandingScreen.EVENT_VIEW = 'main_view';
