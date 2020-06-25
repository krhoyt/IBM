class Samples extends Observer {
  constructor() {
    // Inherit
    super();

    // Classifier name
    this.name = null;
    
    // Event handler references
    // For events added and removed programmatically
    this.doRemoveNew = this.doRemoveNew.bind( this );
    this.doRemoveExisting = this.doRemoveExisting.bind( this );

    // Scrollable display of captured face images
    this.list = document.querySelector( 'div.screen:nth-of-type( 3 ) > div.browse > div.list' );
  }

  // Get faces captured
  getData() {
    let result = [];

    for( let s = 0; s < this.list.children.length; s++ ) {
      // New faces are all that we are interested in getting
      // New images will have URI attribute
      if( this.list.children[s].hasAttribute( 'data-uri' ) ) {
        result.push( {
          width: parseInt( this.list.children[s].getAttribute( 'data-width' ) ),
          height: parseInt( this.list.children[s].getAttribute( 'data-height' ) ),
          uri: this.list.children[s].getAttribute( 'data-uri' )
        } );
      }
    }

    return result;
  }

  // Put images into list
  // Wholesale for known classes
  setData( images ) {
    // Clear existing
    this.clear();

    // Build list
    for( let i = 0; i < images.length; i++ ) {
      let element = document.createElement( 'div' );
      
      element.style.backgroundImage = `url( 'classifier/${this.name}/${images[i]}' )`;
      element.setAttribute( 'data-class', this.name );
      element.setAttribute( 'data-file', images[i] );
      element.addEventListener( 'click', this.doRemoveExisting );
      this.list.appendChild( element );
    }
  }

  // Clear list
  clear() {
    while( this.list.children.length > 0 ) {
      this.list.children[0].remove();
    }
  }

  // Number of images in the list
  length() {
    return this.list.children.length;
  }

  // Add a new image to the list
  push( image ) {
    let element = document.createElement( 'div' );

    element.style.backgroundImage = `url( ${image.uri} )`;
    element.setAttribute( 'data-width', image.width );
    element.setAttribute( 'data-height', image.height );
    element.setAttribute( 'data-uri', image.uri );
    element.addEventListener( 'click', this.doRemoveNew );        
    this.list.appendChild( element );    
  }

  // Remove an element from the list
  // Accomplished by simply clicking on image
  remove( name ) {
    let element = this.list.querySelector( `div[data-file="${name}"]` );

    element.removeEventListener( 'click', this.doRemoveExisting );
    element.remove();
  }

  // Notify listeners of removal
  // Existing image
  doRemoveExisting( evt ) {
    this.emit( Samples.EVENT_REMOVE, {
      class: evt.target.getAttribute( 'data-class' ),
      file: evt.target.getAttribute( 'data-file' )
    } );
  }

  // Notify listeners of removal
  // New image
  doRemoveNew( evt ) {
    evt.target.removeEventListener( 'click', this.doRemoveNew );
    evt.target.remove();
  }
}

// Constants
Samples.EVENT_REMOVE = 'samples_remove_existing';
