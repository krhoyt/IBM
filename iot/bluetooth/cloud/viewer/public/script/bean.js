class Bean {

  constructor() {
    // Properties
    this.fahrenheit = true;
    this.reading = 0;

    // Cloudant
    // Continuous feed
    this.cloudant = new Cloudant();
    this.cloudant.addEventListener( Cloudant.BEAN_READING, evt => this.doFeed( evt ) );

    // Camera
    this.camera = new Camera( 'video' );

    // Charts
    this.axis_x = new Chart( '#x_axis' );
    this.axis_y = new Chart( '#y_axis' );
    this.axis_z = new Chart( '#z_axis' );   

    // Temperature
    this.temperature = document.querySelector( '#temperature' );
    this.temperature.innerHTML = '';
    this.temperature.parentElement.addEventListener( 'click', evt => this.doToggle( evt ) );
  }

  // Database update
  // Store reference
  // Display updates
  doFeed( evt ) {
    // Store reading
    this.reading = Object.assign( this.reading, evt );

    // Update charts
    this.axis_x.append( evt.x );
    this.axis_y.append( evt.y );    
    this.axis_z.append( evt.z );    

    // Update temperature
    this.updateTemperature();    

    // Debug
    console.log( evt );    
  }

  // Toggle fahrenhiet and celcius
  // Internationalization y'all
  doToggle( evt ) {
    if( this.fahrenheit ) {
      this.fahrenheit = false;
    } else {
      this.fahrenheit = true;
    }

    // Display updates
    this.updateTemperature();
  }
  
  // Update the temperature display
  // Fahrenhiet or celcius
  updateTemperature() {
    if( this.fahrenheit ) {
      this.temperature.innerHTML = Math.round( ( this.reading.temperature * 1.80 ) + 32 ) + '&deg';
    } else {
      this.temperature.innerHTML = this.reading.temperature + '&deg;';
    }
  }

}

// Main application
var app = new Bean();
