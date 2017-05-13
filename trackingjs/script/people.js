class People {
  // References and event hooks
  constructor() {
    this.layout = document.querySelector( '#layout' );
    this.layout.addEventListener( 'dragover', evt => this.doDragOver( evt ) );
    this.layout.addEventListener( 'drop', evt => this.doDragDrop( evt ) );

    this.holder = document.querySelector( '#holder' );
    this.holder.addEventListener( 'load', evt => this.doImage( evt ) );

    this.reader = new FileReader();
    this.reader.addEventListener( 'load', evt => this.doRead( evt ) );

    this.surface = document.querySelector( '#surface' );
    this.context = null;

    this.uploader = document.querySelector( '#uploader' );
    this.uploader.addEventListener( 'change', evt => this.doUpload( evt ) );

    this.tracker = new tracking.ObjectTracker( 'face' );
    this.tracker.setStepSize( People.STEP_SIZE );
    this.tracker.addListener( 'track', evt => this.doTrack( evt ) );
    console.log( this.tracker );
  }

  // Read file locally
  process( file ) {
    this.reader.readAsDataURL( file );
  }

  // File dropped on viewport
  // Prevent default behavior (view)
  // Start analyzing
  doDragDrop( evt ) {
    evt.stopPropagation();
    evt.preventDefault();
    this.process( evt.dataTransfer.files[0] );
  }

  // File is dragged over viewport
  // Prevent default behavior (view)
  // Enable drop
  doDragOver( evt ) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';    
  }

  // Image element loaded
  // Scale respective canvas surface
  // Paint content
  doImage( evt ) {
    console.log( evt );
    console.log( 'Dimensions: ' + this.holder.clientWidth + 'x' + this.holder.clientHeight );

    // Original image ratio
    // Used to keep dimensions consistent
    // TODO: Account for images that already fit viewport
    let ratio = this.holder.clientWidth / this.holder.clientHeight;
    console.log( 'Ratio: ' + ratio );

    // Landscape or portrait
    // Size canvas respectively
    if( this.holder.clientWidth > this.holder.clientHeight ) {
      console.log( 'Landscape.' );
      this.surface.width = Math.round( window.innerWidth * People.LANDSCAPE_SCALE );
      this.surface.height = this.surface.width / ratio;
    } else {
      console.log( 'Portrait.' );
      this.surface.height = Math.round( window.innerHeight * People.PORTRAIT_SCALE );
      this.surface.width = this.surface.height * ratio;      
    }

    // Get context
    // Draw scaled image on to canvas
    this.context = this.surface.getContext( '2d' );
    this.context.drawImage( this.holder, 0, 0, this.surface.width, this.surface.height );    

    // Find faces
    tracking.track( '#surface', this.tracker );    
  }

  // Finished reading local file
  // Populate image element
  doRead( evt ) {
    console.log( evt );
    this.holder.src = evt.target.result;
  }

  // Facial tracking completed
  // Highlight faces
  doTrack( evt ) {
    console.log( evt );

    // Style
    this.context.beginPath();
    this.context.lineWidth = 6;
    this.context.strokeStyle = 'yellow';

    // Faces
    for( let face of evt.data ) {
      this.context.rect( face.x, face.y, face.width, face.height );
    }

    // Draw
    this.context.stroke();

    // Show
    this.surface.style.opacity = 1.0;

    // Reset for same file selection
    this.uploader.value = '';
  }

  // Called when a file is selected
  // Start analyzing
  doUpload( evt ) {
    console.log( evt );
    this.process( evt.target.files[0] );
  }
}

// Constants
People.LANDSCAPE_SCALE = 0.50;
People.PORTRAIT_SCALE = 0.75;
People.STEP_SIZE = 1.7;

// Instantiate application
let app = new People();
