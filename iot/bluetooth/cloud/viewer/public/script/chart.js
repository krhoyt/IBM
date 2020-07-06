class Chart {

  constructor( path ) {
    // Reading history
    this.history = [];

    // DIV element
    this.root = document.querySelector( path );
    
    // SVG element inside root element
    this.svg = document.createElementNS( Chart.SVG_NAMESPACE, 'svg' );
    this.root.appendChild( this.svg );

    // Path where chart is actually drawn
    this.path = document.createElementNS( Chart.SVG_NAMESPACE, 'path' );
    this.svg.appendChild( this.path );
  }

  // Incoming data to render
  append( reading ) {
    // Track last ten (10) reports    
    this.history.push( reading );

    if( this.history.length > 10 ) {
      this.history.splice( 0, 1 );
    }

    // Render if two (2) points or more      
    if( this.history.length > 2 ) {
      this.render();
    }
  }

  // Linear transform
  // Take a value in one range and respectively place in a second range  
  map( x, in_min, in_max, out_min, out_max ) {
    return ( x - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
  }

  // Render the chart
  render() {
    let height = this.root.clientHeight * 0.90;
    let data = '';
    let remainder = this.root.clientHeight * 0.05;
    let step = this.root.clientWidth / 9;

    // Build chart path
    for( let r = 0; r < this.history.length; r++ ) {
      // Map acceleromater to view
      let mapped = this.map( this.history[r], -300, 300, 0, height );
      
      // Determine coordinate
      let point = {
        x: step * r,
        y: mapped + remainder
      };

      // Calculate path
      if( r == 0 ) {
        data = 'M ' + point.x + ' ' + point.y;
      } else {
        data = data + ' L ' + point.x + ' ' + point.y;
      }
    }

    // Update path
    this.path.setAttributeNS( null, 'd', data );
  }

}

// Constants
// SVG namespace
Chart.SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
