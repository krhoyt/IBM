class Recognition {
  constructor() {
    // Custom classifier ID
    // Faces detected in capture
    this.classifier = null;
    this.people = [];

    // Event listner for capture
    // Reference to add or remove programmatically
    // Cannot capture if video not present or processing
    this.doCameraClick = this.doCameraClick.bind( this );

    // Element references
    this.video = document.querySelector( 'video' );
    this.camera = document.querySelector( 'button.camera' );
    this.hint = document.querySelector( 'p' );
    this.canvas = document.querySelector( 'canvas.camera' );
    this.crop = document.querySelector( 'canvas.crop' );
    this.context = this.canvas.getContext( '2d' );

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

      // Enable capture button now that we have video
      this.camera.classList.remove( 'disabled' );
      this.camera.addEventListener( 'click', this.doCameraClick );
    } ).catch( ( error ) => {
      console.log( error );
    } );             

    // Get the current classifier
    fetch( '/api/watson/classifiers' )
    .then( ( response ) => {return response.json();} )
    .then( ( data ) => {
      // this.classifier = data.classifiers[0].classifier_id;
      this.classifier = Recognition.CLASSIFIER_ID;
    } );
  }

  // Data URI from canvas to image file
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

  // User wants to capture an image
  doCameraClick( evt ) {
    // Disable further captures until processing is complete
    this.camera.classList.add( 'disabled' );
    this.camera.removeEventListener( 'click', this.doCameraClick );

    // Put video content on canvas of same size
    this.context.drawImage( this.video, 0, 0, 320, 240 );

    // Get the pixel data
    let pixels = this.context.getImageData( 0, 0, this.canvas.width, this.canvas.height );
    
    // Grayscale
    // Generate facial detection settings
    jsfeat.imgproc.grayscale( pixels.data, this.canvas.width, this.canvas.height, this.image );
    jsfeat.imgproc.compute_integral_image( this.image, this.sum, this.square, null );    

    // Found faces in capture
    let found = jsfeat.haar.detect_multi_scale( 
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
    found = jsfeat.haar.group_rectangles( found, 1 );

    // No faces found
    // Inform via hint
    // Allow additional capture
    if( found.length === 0 ) {
      this.hint.innerHTML = 'No faces detected.';
      this.camera.classList.remove( 'disabled' );
      this.camera.addEventListener( 'click', this.doCameraClick );

      // Exit
      return;
    }

    // Faces have been found
    // Build multiple form
    // Using current classifier
    let form = new FormData();    
    form.append( 'classifier', this.classifier );    

    // Crop faces
    for( let f = 0; f < found.length; f++ ) {
      // Location of face
      let x = Math.floor( found[found.length - 1].x );
      let y = Math.floor( found[found.length - 1].y );      
      let width = Math.floor( found[found.length - 1].width );
      let height = Math.floor( found[found.length - 1].height );    

      // Size crop canvas accordingly
      // Put partial data onto cropped canvas
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

      // Get data URI
      // Make image file from data URI
      let data = this.crop.toDataURL();
      let binary = this.toBinary( data );
      let blob = new Blob( [binary], {type: 'image/png'} );

      // Append face to form submission
      form.append( 'file', blob );      
    }

    // Submit form to classify found faces
    fetch( '/api/watson/classify', {
      method: 'POST',
      body: form
    } )
    .then( ( response ) => {return response.json();} )
    .then( ( json ) => {
      console.log( json );

      this.people = [];

      // Find distinct class names
      // TODO: Handle class names with spaces
      for( let i = 0; i < json.images.length; i++ ) {
        for( let c = 0; c < json.images[i].classifiers[0].classes.length; c++ ) {
          let name = json.images[i].classifiers[0].classes[c].class;
          let found = false;

          for( let p = 0; p < this.people.length; p++ ) {
            if( this.people[p] === name ) {
              found = true;
              break;
            }  
          }

          if( !found ) {
            if( json.images[i].classifiers[0].classes[c].score >= 0.70 ) {
              this.people.push( name );
            }
          }
        }
      }

      // Watson did not find matches
      // Adjust verbiage accordingly
      if( this.people.length === 0 ) {
        this.hint.innerHTML = 'No matches were found.';
      } else if( this.people.length === 1 ) {
        // Watson found exactly one match
        this.hint.innerHTML = `${this.people[0]} is in this picture.`;
      } else {
        // Watson found more than one match
        this.hint.innerHTML = `${this.people.join( ' and ' )} are in this picture.`;
      }

      // Allow for more captures
      this.camera.classList.remove( 'disabled' );
      this.camera.addEventListener( 'click', this.doCameraClick );

      // Get Watson Text to Speech token
      return fetch( '/api/watson/tts' );
    } )
    .then( ( response ) => {return response.text();} )
    .then( ( token ) => {
      // Have Watson speak the results
      WatsonSpeech.TextToSpeech.synthesize( {
        text: this.hint.innerHTML,
        token: token
      } );
    } );
  }
}

Recognition.CLASSIFIER_ID = 'faces_1568032002';

// Instantiate application
let app = new Recognition();
