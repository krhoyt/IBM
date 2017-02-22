// Application class
class Bean {

  // Like it says
  constructor() {
    // Properties
    // For Bluetooth, 3D scene
    this.angleX = 0;
    this.angleY = 0;
    this.arms = null;
    this.bluetooth = null;
    this.camera = null;
    this.current = null;
    this.connected = false;
    this.light = null;
    this.pair = null;
    this.picker = null;
    this.rainbow = null;
    this.renderer = null;
    this.rgbled = null;    
    this.scene = null;
    this.service = null;    
    this.temperature = null;
    this.webgl = null;

    // A rainbox of colors
    this.rainbow = [
      {hex: '#fd5308', red: 255, green: 83, blue: 8},
      {hex: '#fb9902', red: 251, green: 153, blue: 2},      
      {hex: '#fabc02', red: 250, green: 188, blue: 2},            
      {hex: '#fefe33', red: 254, green: 254, blue: 51},
      {hex: '#d0ea2b', red: 208, green: 234, blue: 43},            
      {hex: '#66b032', red: 102, green: 176, blue: 50},
      {hex: '#0391ce', red: 3, green: 145, blue: 206},
      {hex: '#0247fe', red: 2, green: 71, blue: 254},
      {hex: '#3d01a4', red: 61, green: 1, blue: 164},
      {hex: '#8601af', red: 134, green: 1, blue: 175},
      {hex: '#a7194b', red: 167, green: 25, blue: 75},
      {hex: '#fe2712', red: 254, green: 39, blue: 18}
    ];

    // Color swatches
    this.swatches = document.querySelectorAll( '.swatch' );

    // Position and populate swatches
    for( let s = 0; s < this.swatches.length; s++ ) {
      this.swatches[s].style.transform = 'translate( 6px, 0 ) rotate( ' + ( s * ( 360 / 12 ) ) + 'deg )';
      this.swatches[s].children[0].style.backgroundColor = this.rainbow[s].hex;
      this.swatches[s].children[0].setAttribute( 'data-index', s );
      this.swatches[s].children[0].addEventListener( 'click', evt => this.doSwatch( evt ) );
    }

    // Color picker
    this.picker = document.getElementById( 'picker' );

    // Current color
    this.current = document.getElementById( 'current' );    
    this.current.addEventListener( 'click', evt => this.doPicker( evt ) );    

    // Button to pair/disconnect
    this.pair = document.getElementById( 'ble' );
    this.pair.addEventListener( 'click', evt => this.doPair( evt ) );

    // Render 3D scene to this DOM element
    this.webgl = document.getElementById( 'webgl' );

    // Build 3d scene
    this.build();
  }

  // Build scene
  build() {
    let group = null;
    let loader = null;

    // Scene proper
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0x4178be );

    // Camera by which we view the scene
    this.camera = new THREE.PerspectiveCamera(
      45, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );

    // Renderer for the scene given our view through the camera
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.shadowMapEnabled = true;

    // Light up the scene
    this.light = new THREE.SpotLight( 0xFFFFFF );
    this.scene.add( this.light );

    // Put scene into the DOM
    this.webgl.appendChild( this.renderer.domElement );

    // External 3D object
    // IBM logo in STL format
    // Exported from TinkerCAD
    group = new THREE.Object3D();
    loader = new THREE.STLLoader();
    loader.load( '../assets/ibm.stl', geometry => {
      let material = null;

      // White material on logo
      material = new THREE.MeshLambertMaterial( {color: 0xffffff} );

      group = new THREE.Mesh( geometry, material );

      // Baseline rotate model
      // Default rotation to zero-based scene rotation
      group.rotation.x = -0.5 * Math.PI;
      group.rotation.z = 0.5 * Math.PI;
      group.scale.set( 0.6, 0.6, 0.6 );
      
      // Add object to scene
      this.scene.add( group );

      // Start rendering
      this.render();
    } );
  }

  // User wants to connect to Bluetooth device
  // Must be initiated by user action
  // Relies heavily on promises
  connect() {
    // Update icon to show we are connecting
    this.pair.classList.remove( 'ready' );
    this.pair.classList.add( 'searching' );

    // Start the connection process
    // Look for my specific Bean+
    navigator.bluetooth.requestDevice( { 
      filters: [
        {name: Bean.NAME}
      ],
      optionalServices: [Bean.SERVICE] 
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
    .then( server => server.getPrimaryService( Bean.SERVICE ) )
    .then( service => {
      this.service = service;
      return this.service.getCharacteristic( Bean.SENSORS );
    } )
    .then( characteristic => {
      // Connected to server
      // Connected to specific service
      // Retrieved a list of characteristics

      // Update icon
      this.pair.classList.remove( 'searching' );
      this.pair.classList.add( 'connected' );

      // Update state
      this.connected = true;

      // Show color picker for LED
      this.picker.style.display = 'block';
      TweenMax.to( this.picker, 0.50, {
        opacity: 1
      } );

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
      return this.service.getCharacteristic( Bean.RGB_LED );
    } )
    .then( characteristic => {
      this.rgbled = characteristic;
    } )
    .catch( error => { 
      console.log( error ); 
    } );    
  }

  // Users wants to disconnect Bluetooth
  disconnect() {
    // Update icon
    this.pair.classList.remove( 'connected' );
    this.pair.classList.add( 'ready' );

    // Hide color picker
    this.pickerHide();
    TweenMax.to( this.picker, 0.50, {
      opacity: 0,
      onComplete: function( picker ) {
        picker.style.display = 'none';
      },
      onCompleteParams: [this.picker]
    } );

    // Disconnect
    this.bluetooth.gatt.disconnect();
  }

  // Linear transform
  // Takes a value in one range
  // Maps it to corresponding value in second range
  map( x, in_min, in_max, out_min, out_max ) {
    return ( x - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
  }

  // Hide the color picker
  // Admittedly some magic numbers in here
  // Better addressed with CSS Animations
  pickerHide() {
    // Shift the picker to the corner
    TweenMax.to( this.picker, 0.50, {
      left: -9,
      bottom: -9
    } );

    // Hide all the swatches
    for( let s = 0; s < this.swatches.length; s++ ) {
      TweenMax.to( this.swatches[s], 0.50, {
        opacity: 0,
        onComplete: function( swatch ) {
          swatch.style.display = 'none';
        },
        onCompleteParams: [this.swatches[s]]
      } )
    }
  }

  // Show the color picker
  pickerShow() {
    // Shift over to make room for swatches
    TweenMax.to( this.picker, 0.50, {
      left: 16,
      bottom: 16
    } );

    // Show all the swatches
    for( let s = 0; s < this.swatches.length; s++ ) {
      this.swatches[s].style.display = 'block';

      TweenMax.to( this.swatches[s], 0.05, {
        opacity: 1,
        delay: 0.05 * s
      } )
    }
  }

  // Render 3D scene
  render() {
    let circleX = 0;
    let circleY = 0;
    let circleZ = 0;

    // Calculate position of camera around logo object
    // Use latest accelerometer values if available
    circleX = 150 * Math.cos( this.angleX * ( Math.PI / 180 ) );
    circleY = 150 * 
      Math.cos( this.angleX * ( Math.PI / 180 ) ) *
      Math.sin( this.angleY * ( Math.PI / 180 ) );    
    circleZ = 150 * Math.sin( this.angleX * ( Math.PI / 180 ) );

    // Position camera around logo
    // Point camera at logo
    this.camera.position.x = circleX;         
    this.camera.position.y = circleY;  
    this.camera.position.z = circleZ;
    this.camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

    // Mirror camera position with light
    this.light.position.set( circleX, circleY, circleZ );

    // Render the scene
    this.renderer.render( this.scene, this.camera );      

    // Keep rendering
    // Browser render pipeline
    requestAnimationFrame( this.render.bind( this ) ); 
  }

  // Scratch characteristic changed
  // Parse content
  // Store relevant accelerometer values
  doCharacteristicChanged( evt ) {
    let scratch = null;
    let content = null;
    let parts = null;

    // Parse to CSV
    // Then to array of strings
    scratch = new Uint8Array( evt.target.value.buffer );
    content = String.fromCharCode.apply( String, scratch );
    parts = content.split( ',' );

    // Get integer value for x-axis
    // Map to 180-degree total range
    this.angleX = parseInt( parts[0] );
    this.angleX = this.map( this.angleX, -270, 270, -90, 90 );

    // Get integer value for y-axis
    // Map to 180-degree total range
    this.angleY = parseInt( parts[1] );
    this.angleY = this.map( this.angleY, -270, 270, -90, 90 );    

    // Temperature in centigrade
    this.temperature = parseInt( parts[3] );

    // Debug
    console.log( content );
  }

  doSwatch( evt ) {
    let color = null;
    let index = null;

    // Get index from selected color
    index = evt.target.getAttribute( 'data-index' );

    // Map index to color options
    color = new Uint8Array( 3 );
    color[0] = this.rainbow[index].red;
    color[1] = this.rainbow[index].green;
    color[2] = this.rainbow[index].blue;

    // Write to characteristic
    this.rgbled.writeValue( color );

    // Show selected color
    // Hide swatches
    this.current.children[0].style.backgroundColor = evt.target.style.backgroundColor;
    this.pickerHide();
  }

  // Disconnected from Bluetooth
  doDisconnected( evt ) {
    this.connected = false;
    console.log( 'Disconnected.' );
  }

  // Called to manage Bluetooth connection
  // Connects or disconnects based on state
  doPair( evt ) {
    if( this.connected ) {
      this.disconnect();
    } else {
      this.connect();
    }    
  }

  // Called to toggle picker
  // Based on position
  // Recfactor to avoid magic number
  doPicker( evt ) {
    if( this.picker.style.left == '16px' ) {
      this.pickerHide();
    } else {
      this.pickerShow();
    }
  }

}

// Constants
Bean.NAME = 'Bean+';
Bean.RGB_LED = 'a495ff22-c5b1-4b44-b512-1370f02d74de';
Bean.SENSORS = 'a495ff21-c5b1-4b44-b512-1370f02d74de';
Bean.SERVICE = 'a495ff20-c5b1-4b44-b512-1370f02d74de';

// Let's do this!
let app = new Bean();
