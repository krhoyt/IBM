class DragDropCanvas {
  constructor( element, mode = 'contain', dimensions = 224 ) {
    // Listeners
    this.listeners = [];

    // Cover or contain
    // For visible canvas
    this.mode = mode;

    // Manage the display
    // Canvas and context
    // Drag and drop
    this.display = {
      canvas: element,
      context: element.getContext( '2d' )
    };
    this.display.canvas.addEventListener( 'dragover', ( evt ) => this.doDragOver( evt ) );
    this.display.canvas.addEventListener( 'drop', ( evt ) => this.doDragDrop( evt ) );    

    // Manage offscreen render
    // Canvas creation and styles
    // Fit to needed dimensions
    this.offscreen = {
      canvas: document.createElement( 'canvas' ), 
      context: null
    };
    this.offscreen.canvas = document.createElement( 'canvas' );
    this.offscreen.canvas.style.position = 'absolute';
    this.offscreen.canvas.style.left = 0;
    this.offscreen.canvas.style.top = 0;
    this.offscreen.canvas.style.visibility = 'hidden';
    this.offscreen.canvas.setAttribute( 'width', isNaN( dimensions ) ? dimensions.width : dimensions );
    this.offscreen.canvas.setAttribute( 'height', isNaN( dimensions ) ? dimensions.height : dimensions );    
    document.body.appendChild( this.offscreen.canvas );

    // Offscreen context
    this.offscreen.context = this.offscreen.canvas.getContext( '2d' );    

    // Holder for dropped file
    // Full size
    this.original = document.createElement( 'img' );
    this.original.addEventListener( 'load', ( evt ) => this.doImageLoad( evt ) );
    this.original.style.position = 'absolute';
    this.original.style.left = 0;
    this.original.style.top = 0;
    this.original.style.visibility = 'hidden';
    document.body.appendChild( this.original );

    // Holder for resized image
    this.resize = document.createElement( 'img' );
    this.resize.addEventListener( 'load', ( evt ) => this.doResizeLoad( evt ) );
    this.resize.style.position = 'absolute';
    this.resize.style.left = 0;
    this.resize.style.top = 0;
    this.resize.style.visibility = 'hidden';
    document.body.appendChild( this.resize );    

    // Reader for dropped file
    this.io = new FileReader();
    this.io.addEventListener( 'load', ( evt ) => this.doFileLoad( evt ) );        
  }

  // Observers
  addEventListener( label, callback ) {
    this.listeners.push( {
      label: label,
      callback: callback
    } );
  }

  // Contain image inside canvas
  contain( canvas ) {
    // First pass of width greater than height
    let aspect = this.original.clientHeight / this.original.clientWidth;    
    let width = canvas.clientWidth;
    let height = Math.round( width * aspect );
    let left = 0;
    let top = Math.round( ( canvas.clientHeight - height ) / 2 );

    // Recalculate for height greater than width
    if( this.original.clientHeight >= this.original.clientWidth ) {
      aspect = this.original.clientWidth / this.original.clientHeight;
      height = canvas.clientHeight;
      width = Math.round( height * aspect );
      top = 0
      left = Math.round( ( canvas.clientWidth - width ) / 2 );;
    }

    return {
      x: left,
      y: top,
      width: width,
      height: height
    };
  }

  // Cover the canvas
  // Center image
  // Crop as needed
  cover( canvas ) {
    // First pass of width greater than height    
    let aspect = this.original.clientHeight / this.original.clientWidth;    
    let height = canvas.clientHeight;
    let width = Math.round( height / aspect );
    let left = Math.round( ( canvas.clientWidth - width ) / 2 );
    let top = 0;

    // Recalculate for height greater than width    
    if( this.original.clientHeight > this.original.clientWidth ) {
      aspect = this.original.clientWidth / this.original.clientHeight;
      width = canvas.clientHeight;
      height = Math.round( width / aspect );
      top = Math.round( ( canvas.clientHeight - height ) / 2 );
      left = 0;
    }

    return {
      x: left,
      y: top,
      width: width,
      height: height
    };
  }

  // Raise observer events
  // Optionally pass some value
  emit( label, evt ) {
    for( let h = 0; h < this.listeners.length; h++ ) {
      if( this.listeners[h].label == label ) {
        this.listeners[h].callback( evt );
      }
    }
  }  

  doDragDrop( evt ) {
    // Item dropped
    // Prevent browser default (opening)
    // Read content of the file
    evt.preventDefault();
    this.io.readAsDataURL( evt.dataTransfer.files[0] );

    // Observe dropped image file
    this.emit( DragDropCanvas.EVENT_DROPPED, evt.dataTransfer.files[0] );            
  }

  doDragOver( evt ) {
    // Item dragged
    // Prevent browser default (opening)
    evt.preventDefault();
  }  

  doFileLoad( evt ) {
    // File contents have been read
    // Place contents into image element
    this.original.src = this.io.result;

    // Observe that full image has been read
    this.emit( DragDropCanvas.EVENT_READ, this.original );    
  }
  
  doImageLoad( evt ) {
    // Get position for containing
    // For placement in visible canvas
    let position = this.contain( this.display.canvas );

    // Recalculate for the option of covering
    if( this.mode === DragDropCanvas.MODE_COVER ) {
      position = this.cover( this.display.canvas );
    }

    // Clear previous
    // Place the image in the canvas
    this.display.context.clearRect( 
      0, 
      0, 
      this.display.canvas.clientWidth, 
      this.display.canvas.clientHeight 
    );
    this.display.context.drawImage( 
      this.original,
      position.x, 
      position.y, 
      position.width, 
      position.height 
    );

    // Calculate position for offscreen canvas
    // Cover entire canvas with image
    position = this.cover( this.offscreen.canvas );

    // Clear previous
    // Place the image in the canvas
    this.offscreen.context.clearRect( 
      0, 
      0, 
      this.offscreen.canvas.clientWidth, 
      this.offscreen.canvas.clientHeight 
    );    
    this.offscreen.context.drawImage( 
      this.original,
      position.x, 
      position.y, 
      position.width, 
      position.height 
    );

    // Put the resized pixels from the canvas to the image
    this.resize.src = this.offscreen.canvas.toDataURL();

    // Observe that full image has been read
    this.emit( DragDropCanvas.EVENT_LOADED, this.original );        
  }

  doResizeLoad( evt ) {
    // Observe that the resized image has been loaded
    this.emit( DragDropCanvas.EVENT_RESIZED, this.resize );
  }
}

DragDropCanvas.EVENT_DROPPED = 'ddc_dropped';
DragDropCanvas.EVENT_LOADED = 'ddc_loaded';
DragDropCanvas.EVENT_READ = 'ddc_read';
DragDropCanvas.EVENT_RESIZED = 'ddc_resized';
DragDropCanvas.MODE_CONTAIN = 'contain';
DragDropCanvas.MODE_COVER = 'cover';
