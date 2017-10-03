class Picker {
  
  constructor( path ) {
    // Root element
    this.root = document.querySelector( path );

    // Palette holder
    this.palette = document.createElement( 'div' );
    this.palette.classList.add( 'palette' );
    this.root.appendChild( this.palette );

    // Color options
    // http://chir.ag/projects/name-that-color
    let colors = [
      {hex: '#fd5308', red: 255, green: 83, blue: 8, text: 'international orange'},
      {hex: '#fb9902', red: 251, green: 153, blue: 2, text: 'california'},      
      {hex: '#fabc02', red: 250, green: 188, blue: 2, text: 'selective yellow'},            
      {hex: '#fefe33', red: 254, green: 254, blue: 51, text: 'golden fizz'},
      {hex: '#d0ea2b', red: 208, green: 234, blue: 43, text: 'pear'},            
      {hex: '#66b032', red: 102, green: 176, blue: 50, text: 'sushi'},
      {hex: '#0391ce', red: 3, green: 145, blue: 206, text: 'cerulean'},
      {hex: '#0247fe', red: 2, green: 71, blue: 254, text: 'blue ribbon'},
      {hex: '#3d01a4', red: 61, green: 1, blue: 164, text: 'pigment indigo'},
      {hex: '#8601af', red: 134, green: 1, blue: 175, text: 'purple'},
      {hex: '#a7194b', red: 167, green: 25, blue: 75, text: 'maroon flush'},
      {hex: '#fe2712', red: 254, green: 39, blue: 18, text: 'scarlet'}    
    ];

    // Rotation based on supplied colors
    let degrees = 360 / colors.length;

    // Store swatch DOM element references
    this.swatches = [];

    // Create swatches
    for( let s = 0; s < colors.length; s++ ) {
      // New swatch
      // Rotate accordingly
      let swatch = document.createElement( 'div' );
      swatch.classList.add( 'swatch' );
      swatch.style.transform = 
        'translate( ' + ( Picker.SWATCH_WIDTH / 2 ) + 'px, 0 ) ' + 
        'rotate( ' + ( s * degrees ) + 'deg )';    
      this.swatches.push( swatch );

      // Color within swatch
      // Actual clickable surface
      // Keeps color values in attributes
      let color = document.createElement( 'button' );
      color.classList.add( 'color' );
      color.style.backgroundColor = colors[s].hex;
      color.setAttribute( 'data-hex', colors[s].hex );
      color.setAttribute( 'data-red', colors[s].red );
      color.setAttribute( 'data-green', colors[s].green );
      color.setAttribute( 'data-blue', colors[s].blue );
      color.setAttribute( 'data-text', colors[s].text );
      color.addEventListener( 'click', evt => this.doSwatchClick( evt ) );
      swatch.appendChild( color );

      // Add swatch to palette control
      this.palette.appendChild( swatch );
    }

    // Ring around currently selected color
    let highlight = document.createElement( 'div' );
    highlight.classList.add( 'current' );

    // Currently selected color
    this.current = document.createElement( 'div' );
    this.current.classList.add( 'color' );
    this.current.addEventListener( 'click', evt => this.doCurrentClick( evt ) );
    highlight.appendChild( this.current );

    // Add to palette control
    this.root.appendChild( highlight );
  }

  // Hide element
  hide() {
    TweenMax.to( this.root, 0.50, {
      opacity: 0,
      onComplete: this.doHidden,
      onCompleteParams: [this.root]
    } );
  }

  // Show element
  show() {
    // Clear from previous used
    this.current.style.backgroundColor = 'rgba( 255, 255, 255, 0 )';
    this.current.removeAttribute( 'data-text' );

    this.root.style.display = 'block';
    TweenMax.to( this.root, 0.50, {
      opacity: 1
    } );
  }

  // A phrase describing the current state
  status() {
    let phrase = 'The currently selected color is ';

    if( this.current.hasAttribute( 'data-text' ) ) {
      phrase = phrase + this.current.getAttribute( 'data-text' );
    } else {
      phrase = 'There is no currently selected color.';
    }

    return phrase;
  }

  // User wants to change the color
  // Show the swatches
  // Alternatively report status
  doCurrentClick( evt ) {
    if( evt.altKey ) {
      let alternate = new CustomEvent( Picker.ALTERNATE, {
        detail: {
          status: this.status()
        }
      } );
      this.root.dispatchEvent( alternate );
    } else {
      // Move center inwards
      // Account for ring of swatches
      this.root.classList.add( 'flower' );

      // Show each swatch in turn
      for( let s = 0; s < this.swatches.length; s++ ) {
        this.swatches[s].style.display = 'block';
        TweenMax.to( this.swatches[s], 0.05, {
          opacity: 1,
          delay: 0.05 * s
        } );
      }
    }
  }

  // Element no longer visible
  // Remove from display (logical)
  doHidden( element ) {
    element.style.display = 'none';
  }

  // Color selected
  doSwatchClick( evt ) {
    // Get color from selected swatch
    this.current.style.backgroundColor = evt.target.getAttribute( 'data-hex' );    
    this.current.setAttribute( 'data-text', evt.target.getAttribute( 'data-text' ) );

    // Hide swatches
    for( let s = 0; s < this.swatches.length; s++ ) {
      TweenMax.to( this.swatches[s], 0.50, {
        opacity: 0,
        onComplete: this.doHidden,
        onCompleteParams: [this.swatches[s]]
      } );
    }

    // Reset control into corner
    this.root.classList.remove( 'flower' );

    // Notify of color change
    let color = new CustomEvent( Picker.COLOR, {
      detail: {
        red: parseInt( evt.target.getAttribute( 'data-red' ) ),
        green: parseInt( evt.target.getAttribute( 'data-green' ) ),
        blue: parseInt( evt.target.getAttribute( 'data-blue' ) )
      }
    } );
    this.root.dispatchEvent( color );
  }

}

// Constants
Picker.ALTERNATE = 'picker_alternte';
Picker.COLOR = 'picker_color';
Picker.SWATCH_WIDTH = 12;
