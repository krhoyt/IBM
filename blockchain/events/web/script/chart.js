class Chart {
  constructor() {
    this.svg = document.querySelector( '.chart .render' );

    // Two pixels padding on top and bottom
    this.chart_height = this.svg.clientHeight - ( Chart.BOTTOM + 2 + 2 );    
    this.range_low = null;
    this.range_high = null;
  }

  // Linear transform
  map( x, in_min, in_max, out_min, out_max ) {
    return ( x - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
  }

  update( value ) {
    // Get affected chart element
    let change = this.svg.querySelector( 'rect[data-symbol=\'' + value.symbol + '\']' );

    // Current location
    let current_y = parseInt( change.getAttributeNS( null, 'y' ) );

    // Changes in location
    let value_last = this.map( value.last, this.range_low, this.range_high, 0, this.chart_height );
    let value_change = this.map( value.last + value.change, this.range_low, this.range_high, 0, this.chart_height );
    let value_y = Math.round( this.svg.clientHeight - Chart.BOTTOM - 2 - value_last );

    // Animate changes
    TweenMax.to( change, 1, {
      attr: {
        y: Math.min( current_y, value_y ),
        height: Math.max( current_y, value_y ) - Math.min( current_y, value_y ),
        fill: value.change > 0 ? Table.COLOR_GREEN : Table.COLOR_RED
      }
    } );

    /*
    // Immediate change
    change.setAttributeNS( null, 'y', Math.min( current_y, value_y ) );
    change.setAttributeNS( null, 'height', Math.max( current_y, value_y ) - Math.min( current_y, value_y ) );
    change.setAttributeNS( null, 'fill', value.change > 0 ? Table.COLOR_GREEN : Table.COLOR_RED );
    */
  }

  set data( value ) {
    // Clean up
    while( this.svg.children.length > 0 ) {
      this.svg.children[0].remove();
    }

    // Measurements
    let label_width = this.svg.clientWidth / value.length;

    // Line
    let divider = document.createElementNS( Chart.SVG, 'rect' );
    divider.setAttributeNS( null, 'x', 0 );
    divider.setAttributeNS( null, 'y', this.svg.clientHeight - 20 );
    divider.setAttributeNS( null, 'width', this.svg.clientWidth );
    divider.setAttributeNS( null, 'height', 0.50 );
    divider.setAttributeNS( null, 'fill', 'rgba( 0, 0, 0, 0.12 )' );    
    this.svg.appendChild( divider );
    
    // Labels
    // Have to iterate twice
    // Once to get price range
    // Once to draw the prices in those ranges
    for( let s = 0; s < value.length; s++ ) {
      let label = document.createElementNS( Chart.SVG, 'text' );

      // Stock symbol
      label.setAttributeNS( null, 'x', ( s * label_width ) + ( label_width / 2 ) );
      label.setAttributeNS( null, 'y', this.svg.clientHeight - ( Chart.BOTTOM / 2 ) + 2 );
      label.setAttributeNS( null, 'text-anchor', 'middle' );
      label.setAttributeNS( null, 'alignment-baseline', 'middle' );
      label.textContent = value[s].symbol;
      label.classList.add( 'label' );

      this.svg.appendChild( label );

      // Track range
      if( this.range_low == null ) {
        this.range_low = value[s].low;
        this.range_high = value[s].high;
      } else {
        this.range_low = Math.min( value[s].low, this.range_low );
        this.range_high = Math.max( value[s].high, this.range_high );
      }
    }

    console.log( this.range_low + ' - ' + this.range_high );

    for( let s = 0; s < value.length; s++ ) {
      let value_high = this.map( value[s].high, this.range_low, this.range_high, 0, this.chart_height );
      let value_low = this.map( value[s].low, this.range_low, this.range_high, 0, this.chart_height );
      let value_last = this.map( value[s].last, this.range_low, this.range_high, 0, this.chart_height );

      // Vertical range lines
      let baseline = document.createElementNS( Chart.SVG, 'rect' );
      baseline.setAttributeNS( null, 'x', Math.round( ( s * label_width ) + ( label_width / 2 ) ) );
      baseline.setAttributeNS( null, 'y', ( this.svg.clientHeight - Chart.BOTTOM - 2 - value_high ) );      
      baseline.setAttributeNS( null, 'width', 0.50 );
      baseline.setAttributeNS( null, 'height', value_high - value_low );      
      baseline.setAttributeNS( null, 'fill', 'rgba( 0, 0, 0, 0.87 )' );
      this.svg.appendChild( baseline );

      // Horizontal change marks
      let change = document.createElementNS( Chart.SVG, 'rect' );
      change.setAttributeNS( null, 'x', Math.round( ( s * label_width ) + ( label_width / 2 ) - 5 ) );      
      change.setAttributeNS( null, 'y', Math.round( this.svg.clientHeight - Chart.BOTTOM - 2 - value_last ) );      
      change.setAttributeNS( null, 'width', 11 );
      change.setAttributeNS( null, 'height', 1 );
      change.setAttributeNS( null, 'fill', value[s].change > 0 ? Table.COLOR_GREEN : Table.COLOR_RED );
      change.setAttributeNS( null, 'data-symbol', value[s].symbol );
      this.svg.appendChild( change );
    }
  }
}

Chart.BOTTOM = 20;
Chart.SVG = 'http://www.w3.org/2000/svg';
