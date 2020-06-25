class RecordScreen extends Screen {
  constructor() {
    super( document.querySelector( '#record' ) );

    // Properties
    this.faces = [];
    this.interval = null;
    this.name = null;
    this.spokes = [];
    this.task = null;

    // Event handler for save operation
    // Kept as reference to add and remove
    this.doSaveDown = this.doSaveDown.bind( this );

    // Tracking.JS
    this.tracker = new tracking.ObjectTracker( 'face' );
    this.tracker.setInitialScale( 4 );
    this.tracker.setStepSize( 2 );
    this.tracker.setEdgesDensity( 0.1 );
    this.tracker.on( 'track', ( evt ) => this.doTrack( evt ) );

    // Canvas for cropping
    this.canvas = this.root.querySelector( 'canvas' );

    // Video for web camera
    // TOOD: Move fixed dimensions to constants
    this.video = this.root.querySelector( 'video' );
    this.video.height = 320;
    this.video.style.marginLeft = Math.round( ( window.innerWidth - 240 ) / 2 ) + 'px';          

    // Activate web camera
    navigator.mediaDevices.getUserMedia( {
      audio: false, 
      video: true
    } ).then( ( stream ) => {
      this.video.srcObject = stream;
      this.video.play();        

      // Kind of start tracking
      // Then immediately stop
      // Strange API
      this.task = tracking.track( this.video, this.tracker );    
      this.task.stop();  
    } ).catch( ( error ) => {
      console.log( error );
    } );          

    // Progress marks and masking via SVG
    this.svg = this.root.querySelector( 'svg' );
    this.svg.setAttributeNS( null, 'width', window.innerWidth );
    this.svg.setAttributeNS( null, 'height', 320 );    

    // Take pictures from web camera
    this.capture = this.root.querySelector( 'button.capture' );
    this.capture.addEventListener( 'touchstart', ( evt ) => this.doCaptureDown( evt ) );
    this.capture.addEventListener( 'touchend', ( evt ) => this.doCaptureUp( evt ) );

    // No new class
    this.cancel = this.root.querySelector( 'button.cancel' );
    this.cancel.addEventListener( 'touchstart', ( evt ) => this.doCancelDown( evt ) );

    // Save this class
    this.save = this.root.querySelector( 'button.save' );

    // Build the SVG mask and progress indicator
    this.build();
  }

  build() {
    let width = window.innerWidth;
    let height = 320;

    // Surface to mask
    let element = document.createElementNS( RecordScreen.SVG_NAMESPACE, 'rect' );
    element.setAttributeNS( null, 'x', 0 );
    element.setAttributeNS( null, 'y', 0 );
    element.setAttributeNS( null, 'width', width );
    element.setAttributeNS( null, 'height', height );
    element.setAttributeNS( null, 'fill', 'rgb( 245, 247, 250 )' );
    element.setAttributeNS( null, 'style', 'mask: url( #camera );' );
    this.svg.appendChild( element );        

    // Definitiions
    let defs = document.createElementNS( RecordScreen.SVG_NAMESPACE, 'defs' );
    this.svg.appendChild( defs );  

    // Mask
    let camera = document.createElementNS( RecordScreen.SVG_NAMESPACE, 'mask' );
    camera.setAttributeNS( null, 'id', 'camera' );
    defs.appendChild( camera );            

    // Cutout
    element = document.createElementNS( RecordScreen.SVG_NAMESPACE, 'rect' );
    element.setAttributeNS( null, 'x', 0 );
    element.setAttributeNS( null, 'y', 0 );
    element.setAttributeNS( null, 'width', width );
    element.setAttributeNS( null, 'height', height );
    element.setAttributeNS( null, 'fill', 'white' );    
    camera.appendChild( element );    

    // Mask
    element = document.createElementNS( RecordScreen.SVG_NAMESPACE, 'circle' );
    element.setAttributeNS( null, 'cx', Math.ceil( width / 2 ) );
    element.setAttributeNS( null, 'cy', Math.ceil( height / 2 ) );
    element.setAttributeNS( null, 'r', 120 );      
    element.setAttributeNS( null, 'fill', 'black' );                    
    camera.appendChild( element );    

    // Progress pins 
    for( let p = 0; p < 360; p += 6 ) {
      element = document.createElementNS( RecordScreen.SVG_NAMESPACE, 'rect' );    
      element.setAttributeNS( null, 'x', window.innerWidth / 2 );
      element.setAttributeNS( null, 'y', this.svg.clientHeight / 2 );
      element.setAttributeNS( null, 'width', 1 );
      element.setAttributeNS( null, 'height', 10 );
      element.setAttributeNS( null, 'fill', RecordScreen.BLUE_COLOR );    
      element.setAttributeNS( null, 'transform', `rotate( ${p}, ${window.innerWidth / 2}, ${this.svg.clientHeight / 2} ) translate( 0, 128 )` );    
      this.svg.appendChild( element );      

      this.spokes.push( element );
    }
  }

  // Clear previous screen usage
  clear() {
    // No faces recorded
    this.faces = [];

    // Stop timer
    if( this.interval ) {
      clearInterval( this.interval );
      this.interval = null;
    }

    // Reset progress indicators
    for( let s = 0; s < this.spokes.length; s++ ) {
      this.spokes[s].setAttributeNS( null, 'fill', RecordScreen.BLUE_COLOR );
      this.spokes[s].setAttributeNS( null, 'stroke', null );
      this.spokes[s].setAttributeNS( null, 'stroke-width',null );
    }                 

    // Cannot save empty record
    this.save.removeEventListener( 'touchstart', this.doSaveDown );
    this.save.classList.add( 'disabled' );
  }

  // Store any images added
  store() {
    // Mulitpart form
    // Name of person as class
    let form = new FormData();    
    form.append( 'name', this.name );    

    // Make an image file from the URI data
    // Append as file to form
    for( let f = 0; f < this.faces.length; f++ ) {
      let binary = this.toBinary( this.faces[f].uri );
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
        // this.emit( EditScreen.EVENT_COMPLETE, json );
        this.emit( RecordScreen.EVENT_SAVED, json );
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

  // No new class
  doCancelDown( evt ) {
    this.emit( RecordScreen.EVENT_BACK, null );
  }

  // Start capturing images
  doCaptureDown( evt ) {
    // Timer to check progress
    this.interval = setInterval( () => {
      // How many faces so far
      let percent = this.faces.length / RecordScreen.MIN_CAPTURE;

      // Enough data to save
      if( percent >= 1.0 ) {
        percent = this.spokes.length;

        this.save.addEventListener( 'touchstart', this.doSaveDown );
        this.save.classList.remove( 'disabled' );
      } else {
        // Number of spokes for this progress
        percent = Math.floor( percent * this.spokes.length ); 
      }

      // Show progress
      for( let p = 0; p < percent; p++ ) {
        this.spokes[p].setAttributeNS( null, 'fill', 'lime' );
        this.spokes[p].setAttributeNS( null, 'stroke', 'lime' );
        this.spokes[p].setAttributeNS( null, 'stroke-width', '1' );
      }             
    }, RecordScreen.DURATION );

    // Start looking for faces
    this.task.run();
  }

  // Done or paused capturing
  doCaptureUp( evt ) {
    // Clear timer
    clearInterval( this.interval );
    this.interval = null;

    // Stop looking for faces
    this.task.stop();
  }

  // Save class
  // TODO: Spinner indictor on button
  doSaveDown( evt ) {
    this.save.removeEventListener( 'touchstart', this.doSaveDown );
    this.save.classList.add( 'disabled' );
    
    this.store();
  }

  // Tracking.JS event
  doTrack( evt ) {
    // Any faces found
    if( evt.data.length > 0 ) {
      // Size cropping canvas to face dimensions
      this.canvas.width = evt.data[0].width;
      this.canvas.height = evt.data[0].height;

      // Context changes when canvas size changes
      // Avoid distortion by getting new context
      let context = this.canvas.getContext( '2d' );

      // Draw the face from video
      // Multiple of two
      // Video is double what is displayed
      context.drawImage( 
        this.video, 
        evt.data[0].x * 2, 
        evt.data[0].y * 2, 
        evt.data[0].width * 2, 
        evt.data[0].height * 2, 
        0, 
        0, 
        this.canvas.width, 
        this.canvas.height 
      );

      // Track faces captured
      this.faces.push( {
        width: this.canvas.width,
        height: this.canvas.height,
        uri: this.canvas.toDataURL()      
      } );
    }    
  }
}

// Constants
RecordScreen.BLUE_COLOR = '#4970ad';
RecordScreen.DURATION = 600;
RecordScreen.EVENT_BACK = 'record_back';
RecordScreen.EVENT_SAVED = 'record_save';
RecordScreen.MIN_CAPTURE = 60;
RecordScreen.SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
