class EditScreen extends Observer {
  constructor() {
    // Inherit
    super();

    // Save captured faces
    // Reference used to add and remove event listener
    this.doDoneClick = this.doDoneClick.bind( this );
    
    // Capture component
    // Based on video element
    this.capture = new Capture();
    this.capture.addEventListener( Capture.EVENT_END, ( evt ) => this.doCaptureEnd( evt ) );    
    this.capture.addEventListener( Capture.EVENT_PLAYING, ( evt ) => this.doCapturePlaying( evt ) );
    this.capture.addEventListener( Capture.EVENT_RECORD, ( evt ) => this.doCaptureRecord( evt ) );    

    // Captured images
    // For active and previously stored
    this.samples = new Samples();
    this.samples.addEventListener( Samples.EVENT_REMOVE, ( evt ) => this.doRemove( evt ) );

    // Element references
    this.root = document.querySelector( 'div.screen:nth-of-type( 3 )' );
    this.icon = document.querySelector( 'div.screen:nth-of-type( 3 ) > div.person' );
    this.name = document.querySelector( 'div.screen:nth-of-type( 3 ) > p.person' );
    this.cancel = document.querySelector( 'div.screen:nth-of-type( 3 ) > div.controls > button.cancel' );
    this.cancel.addEventListener( 'click', ( evt ) => this.doCancelClick( evt ) );    
    this.camera = document.querySelector( 'div.screen:nth-of-type( 3 ) > div.controls > button.capture' );
    this.camera.addEventListener( 'mousedown', ( evt ) => this.doCameraDown( evt ) );        
    this.camera.addEventListener( 'mouseup', ( evt ) => this.doCameraUp( evt ) );            
    this.done = document.querySelector( 'div.screen:nth-of-type( 3 ) > div.controls > button.done' );
  }

  // Get the icon
  // First image in class
  getIcon() {
    return this.icon.getAttribute( 'data-icon' );
  }

  // Set icon
  setIcon( value ) {
    // Handle different means of setting icon
    if( value.indexOf( '/' ) === 0 ) {
      this.icon.style.backgroundImage = `url( 'classifier/${this.getName()}/${value}' )`;
    } else {
      this.icon.style.backgroundImage = `url( 'classifier/${value}' )`;      
    }

    // Remove placeholder
    // Keep reference to 
    this.icon.classList.remove( 'empty' );
    this.icon.setAttribute( 'data-icon', value );
  }

  // Get name of classifier
  getName() {
    return this.name.innerHTML.trim();
  }

  // Set name of classifier
  // Also in screen label
  setName( value ) {
    this.name.innerHTML = value;
  }

  // Clear the screen
  clear() {
    this.root.setAttribute( 'data-class', null );
    this.icon.classList.add( 'empty' );
    this.icon.style.backgroundImage = null;
    this.name.innerHTML = '&nbsp;';
    this.samples.clear();
    this.validate();
  }

  // Hide the screen
  hide() {
    this.root.style.display = 'none';
  }

  // Load existing images saved
  // Allows to add in different settings
  load( data ) {
    this.setName( data.class );
    this.setIcon( data.class + '/' + data.file );

    // Retrieve list from server
    fetch( '/api/storage/class?name=' + data.class )
    .then( ( response ) => {return response.json();} )
    .then( ( images ) => {
      this.samples.name = data.class;
      this.samples.setData( images );
    } );    
  }

  // Show the screen
  show() {
    this.root.style.display = 'flex';
  }    

  // Store any images added
  store( name ) {
    // Mulitpart form
    // Name of person as class
    let form = new FormData();    
    form.append( 'name', name );    

    // Get the images
    // New images will have URI
    let images = this.samples.getData();

    // Make an image file from the URI data
    // Append as file to form
    for( let i = 0; i < images.length; i++ ) {
      let binary = this.toBinary( images[i].uri );
      let blob = new Blob( [binary], {type: 'image/png'} );

      form.append( 'file', blob );      
    }

    // Upload images to server
    fetch( '/api/storage/upload', {
      method: 'POST',
      body: form
    } )
    .then( ( response ) => {return response.json();} )
    .then( ( json ) => {
      if( json.storage ) {
        this.emit( EditScreen.EVENT_COMPLETE, json );
      }
    } );    
  }

  // Make image file from URI
  // PNG image format is used
  toBinary( uri ) {
    let index = uri.indexOf( ',' ) + 1;
    let base = uri.substring( index );
    let raw = atob( base );
    let array = new Uint8Array( raw.length );
  
    for( let i = 0; i < raw.length; i++ ) {
      array[i] = raw.charCodeAt( i );
    }

    return array;    
  }

  // Validate that form can be submitted
  validate() {
    // Samples collected
    if( this.samples.length() > 0 ) {
      this.done.classList.remove( 'disabled' );
      this.done.addEventListener( 'click', this.doDoneClick );
    } else {
      // No new samples present
      this.done.classList.add( 'disabled' );
      this.done.removeEventListener( 'click', this.doDoneClick );      
    }
  }

  // Cancel the screen
  doCancelClick( evt ) {
    this.emit( EditScreen.EVENT_CANCEL, null );
  }

  // Camera button has been pressed
  // Start capturing samples
  doCameraDown( evt ) {
    this.capture.start();
  }

  // Camera button has been released
  // Stop capturing samples
  doCameraUp( evt ) {
    this.capture.stop();
  }  

  // Samples captured and encoded
  // Validate for submission
  doCaptureEnd( evt ) {
    this.validate();
  }  

  // Manage capture button state
  doCapturePlaying( evt ) {
    this.camera.classList.remove( 'disabled' );
  }

  // New sample captured
  // Push to samples collection
  doCaptureRecord( evt ) {
    this.samples.push( evt );
  }

  // Save newly collected samples
  // Will create class if all new
  doDoneClick( evt ) {
    this.store( this.getName() );
  }

  // Remove an image from the samples
  doRemove( evt ) {
    // Call to remove from server file system
    fetch( '/api/storage/image', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'DELETE',
      body: JSON.stringify( evt )
    } ).then( ( response ) => {return response.json();} )
    .then( ( data ) => {
      // Remove confirmed
      // Remove element from user interface
      this.samples.remove( evt.file );
      this.done.classList.remove( 'disabled' );
      this.done.addEventListener( 'click', this.doDoneClick );
    } );
  }
}

// Constants
// TODO: Move API paths to constants
EditScreen.EVENT_CANCEL = 'edit_cancel_click';
EditScreen.EVENT_COMPLETE = 'edit_store_complete';
