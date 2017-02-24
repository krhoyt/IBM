class Bluetooth {

  constructor( path ) {
    // Root element
    this.root = document.querySelector( path );
    this.root.addEventListener( 'click', evt => this.doClick( evt ) );

    // State
    this.connected = false;

    // Bluetooth connectivity
    this.blueooth = null;
    this.service = null;
    this.led = null;
    this.rate = null;
  }

  // Set color of LED
  color( red, green, blue ) {
    // Make sure we are connected
    if( this.connected ) {
      // Put values in scratch format
      let scratch = new Uint8Array( 3 );
      scratch[0] = red;
      scratch[1] = green;
      scratch[2] = blue;

      // Write to characteristic
      this.led.writeValue( scratch );    
    } else {
      console.log( 'Not connected.' );
    }
  }

  // Connect to a device
  connect() {
    // Update icon to show we are connecting
    this.root.classList.remove( 'waiting' );
    this.root.classList.add( 'searching' );

    // Start the connection process
    // Look for my specific Bean+
    navigator.bluetooth.requestDevice( { 
      filters: [
        {name: Bluetooth.NAME}
      ],
      optionalServices: [Bluetooth.SERVICE] 
    } )
    .then( device => {
      // Found device
      // User selected to pair with device
      // Browser now paired with device
      // Connect to attribute server
      this.bluetooth = device;
      this.bluetooth.addEventListener( 'gattserverdisconnected', evt => this.doDisconnected( evt ) );
      return this.bluetooth.gatt.connect() 
    } )
    .then( server => server.getPrimaryService( Bluetooth.SERVICE ) )
    .then( service => {
      this.service = service;
      return this.service.getCharacteristic( Bluetooth.SENSORS );
    } )
    .then( characteristic => {
      // Connected to server
      // Connected to specific service
      // Retrieved a list of characteristics

      // Update icon
      this.root.classList.remove( 'searching' );
      this.root.classList.add( 'connected' );

      // Update state
      this.connected = true;

      // Notify listeners of connection
      let state = new CustomEvent( Bluetooth.CONNECTED, null );
      this.root.dispatchEvent( state );

      // Listen for characteristic changes
      return characteristic.startNotifications();
    } )
    .then( characteristic => {
      // Characteristic change listener
      characteristic.addEventListener(
        'characteristicvaluechanged',
        evt => this.doCharacteristicChanged( evt )
      );
    } )
    .then( service => {
      return this.service.getCharacteristic( Bluetooth.LED );
    } )
    .then( characteristic => {
      this.led = characteristic;
    } )
    .then( service => {
      return this.service.getCharacteristic( Bluetooth.RATE );
    } )
    .then( characteristic => {
      this.rate = characteristic;
    } )    
    .catch( error => { 
      console.log( error ); 
    } ); 
  }
  
  // Disconnect from device
  disconnect() {
    // Update icon
    this.root.classList.remove( 'connected' );
    this.root.classList.add( 'waiting' );

    // Disconnect
    this.bluetooth.gatt.disconnect();
  }

  // Scratch characteristic changed
  // Parse content
  // Pass along relevant values
  doCharacteristicChanged( evt ) {
    // Parse to CSV
    // Then to array of strings
    let scratch = new Uint8Array( evt.target.value.buffer );
    let content = String.fromCharCode.apply( String, scratch );
    let parts = content.split( ',' );

    // Notify of new accelerometer data
    let accelerometer = new CustomEvent( Bluetooth.ACCELEROMETER, {
      detail: {
        x: parseInt( parts[0] ),
        y: parseInt( parts[1] )
      }
    } );
    this.root.dispatchEvent( accelerometer );

    // Notify of new temperature value
    let temperature = new CustomEvent( Bluetooth.TEMPERATURE, {
      detail: {
        temperature: parseInt( parts[2] )
      }
    } );
    this.root.dispatchEvent( temperature );

    // Debug
    console.log( content );
  }

  // Toggle connection
  doClick( evt ) {
    if( this.connected ) {
      this.disconnect();
    } else {
      this.connect();
    }        
  }

  // Disconnected from device
  doDisconnected( evt ) {
    // Update state
    this.connected = false;

    // Let others know
    let state = new CustomEvent( Bluetooth.DISCONNECTED, null );
    this.root.dispatchEvent( state );
  }  

}

// Constants
Bluetooth.ACCELEROMETER = 'bluetooth_accelerometer';
Bluetooth.CONNECTED = 'bluetooth_connected';
Bluetooth.DISCONNECTED = 'bluetooth_disconnected';
Bluetooth.LED = 'a495ff22-c5b1-4b44-b512-1370f02d74de';
Bluetooth.NAME = 'Bean+';
Bluetooth.RATE = 'a495ff22-c5b1-4b44-b512-1370f02d74de';
Bluetooth.SENSORS = 'a495ff21-c5b1-4b44-b512-1370f02d74de';
Bluetooth.SERVICE = 'a495ff20-c5b1-4b44-b512-1370f02d74de';
Bluetooth.TEMPERATURE = 'bluetooth_temperature';
