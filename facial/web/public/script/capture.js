class Capture extends Observer {
  constructor() {
    // Inherit
    super();

    // Flag to keep capturing
    // As long as button is pressed
    this.active = false;

    // Element references
    this.video = document.querySelector( 'div.screen:nth-of-type( 3 ) > div.browse > video' );
    this.canvas = document.querySelector( 'div.screen:nth-of-type( 3 ) > canvas:first-of-type' );
    this.context = this.canvas.getContext( '2d' );
    this.crop = document.querySelector( 'div.screen:nth-of-type( 3 ) > canvas:last-of-type' );

    // Face detection settings
    jsfeat.haar.edges_density = 0.13;
    this.image = new jsfeat.matrix_t( this.canvas.width, this.canvas.height, jsfeat.U8_t );
    this.sum = new Int32Array( ( this.canvas.width + 1 ) * ( this.canvas.height + 1 ) );
    this.square = new Int32Array( ( this.canvas.width + 1 ) * ( this.canvas.height + 1 ) );    
    this.tilted = new Int32Array( ( this.canvas.width + 1 ) * ( this.canvas.height + 1 ) );
    
    // Attach camera to video
    navigator.mediaDevices.getUserMedia( {
      audio: false, 
      video: true
    } ).then( ( stream ) => {
      this.video.srcObject = stream;
      this.video.play();     
      this.emit( Capture.EVENT_PLAYING, null );
    } ).catch( ( error ) => {
      console.log( error );
    } );         
  }

  // Capture button is pressed
  // Look for faces
  draw() {
    // Copy video to canvas of same size
    this.context.drawImage( this.video, 0, 0, this.canvas.width, this.canvas.height );
    
    // Get raw pixels
    let pixels = this.context.getImageData( 0, 0, this.canvas.width, this.canvas.height );
    
    // Grayscale
    // Generate face detection settings
    jsfeat.imgproc.grayscale( pixels.data, this.canvas.width, this.canvas.height, this.image );
    jsfeat.imgproc.compute_integral_image( this.image, this.sum, this.square, null );    

    // Detect the faces in the canvas
    let faces = jsfeat.haar.detect_multi_scale( 
      this.sum, 
      this.square, 
      this.tilted, 
      null, 
      this.image.cols, 
      this.image.rows, 
      jsfeat.haar.frontalface, 
      1.2, 
      1 
    );
    faces = jsfeat.haar.group_rectangles( faces, 1 );

    // If faces have been found
    if( faces.length > 0 ) {
      // Get location of face
      let x = Math.floor( faces[faces.length - 1].x );
      let y = Math.floor( faces[faces.length - 1].y );      
      let width = Math.floor( faces[faces.length - 1].width );
      let height = Math.floor( faces[faces.length - 1].height );

      // Setup cropping canvas
      // Copy only face to crop canvas
      this.crop.width = width;
      this.crop.height = height;      
      let resample = this.crop.getContext( '2d' );
      resample.drawImage( 
        this.canvas, 
        x, 
        y, 
        width, 
        height, 
        0, 
        0, 
        this.crop.width, 
        this.crop.height 
      );

      // Pass along dimensions and data URI
      this.emit( Capture.EVENT_RECORD, {
        width: this.crop.width,
        height: this.crop.height,
        uri: this.crop.toDataURL()
      } );
    }

    // Button is still pressed
    // Keep capturing
    if( this.active ) {
      requestAnimationFrame( () => { return this.draw(); } );        
    } else {
      // Button released
      this.emit( Capture.EVENT_END, this.data );          
    }
  }

  // Start capturing
  start() {
    this.active = true;
    this.draw();
  }

  // Stop capturing
  stop() {
    this.active = false;
  }  
}

// Constants
Capture.EVENT_END = 'capture_end';
Capture.EVENT_PLAYING = 'capture_playing';
Capture.EVENT_RECORD = 'capture_record';
Capture.EVENT_START = 'capture_start';
