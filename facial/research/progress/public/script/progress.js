class ProgressButton {
  constructor( path ) {
    this.root = document.querySelector( path );
    this.svg = this.root.querySelector( 'svg' );

    // Hidden file form field
    this.file = document.querySelector( '#' + this.root.getAttribute( 'for' ) );
    this.file.addEventListener( 'change', evt => this.doFile( evt ) );

    // Reference parts
    this.circle = this.svg.querySelector( 'circle' );
    this.complete = this.svg.querySelector( 'text' );
    this.icon = this.svg.querySelector( '.icon' );
    this.pie = this.svg.querySelector( '.pie' );

    // Complete (0 - 100)
    this.percent = 0;
  }

  // Animate to current completion
  progress() {
    // Completed
    // Reset to ready
    if( this.percent == 100 ) {
      this.circle.setAttributeNS( null, 'opacity', 1 );
      this.pie.setAttributeNS( null, 'opacity', 0 );
      this.complete.setAttributeNS( null, 'opacity', 0 );
      this.icon.setAttributeNS( null, 'opacity', 1 );

      this.percent = 0;
    }

    // Completion arc calculator
    // http://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
    let angle = ( this.percent / 100 ) * 360;
    let radians = ( angle - 90 ) * Math.PI / 180;
    let arc = angle <= 180 ? '0' : '1';
    let slice = {
      x: 28 + ( 28 * Math.cos( radians ) ),
      y: 28 + ( 28 * Math.sin( radians ) )
    }
    let d = [
      'M', 28, 28, 
      'L', 28, 0,
      'A', 28, 28, 1, arc, 1, slice.x, slice.y, 
      'z'
    ].join( ' ' );

    // Update completion pie
    // Update numeric indicator
    this.pie.setAttributeNS( null, 'd', d );
    this.complete.innerHTML = this.percent + '%';
  }

  // File selected
  doFile( evt ) {
    // Set state for upload reporting
    this.icon.setAttributeNS( null, 'opacity', 0 );
    this.circle.setAttributeNS( null, 'opacity', 0.50 );
    this.pie.setAttributeNS( null, 'opacity', 1 );
    this.complete.innerHTML = '0%';
    this.complete.setAttributeNS( null, 'opacity', 1 );

    // Instantiate
    // Hook events if needed
    if( this.xhr == null ) {
      this.xhr = new XMLHttpRequest();
      this.xhr.addEventListener( 'load', evt => this.doLoad( evt ) );
      this.xhr.addEventListener( 'progress', evt => this.doProgress( evt ) );          
    }

    // File to upload
    let data = new FormData();
    data.append( 'attachment', evt.target.files[0] );

    // Send to API
    this.xhr.open( 'POST', '/api/upload/image', true );
    this.xhr.send( data );
  }

  // Upload completed
  // Response recieved
  doLoad( evt ) {
    console.log( 'Complete.' );
    console.log( this.xhr.responseText );
  }

  // Upload in progress
  // Reflect values in visualization
  doProgress( evt ) {
    this.percent = ( evt.loaded / evt.total ) * 100;
    this.progress();
  }
}
