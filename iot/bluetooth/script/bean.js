// Application class
class Bean {

  // Like it says
  constructor() {
    // Properties
    // For Bluetooth, 3D scene
    this.angleX = 0;
    this.angleY = 0;
    this.bluetooth = null;
    this.camera = null;
    this.connected = false;
    this.light = null;
    this.pair = null;
    this.renderer = null;
    this.scene = null;
    this.webgl = null;

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
    .then( service => service.getCharacteristic( Bean.CHARACTERISTIC ) )
    .then( characteristic => {
      // Connected to server
      // Connected to specific service
      // Retrieved a list of characteristics

      // Update icon
      this.pair.classList.remove( 'searching' );
      this.pair.classList.add( 'connected' );

      // Update state
      this.connected = true;

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
    .catch( error => { 
      console.log( error ); 
    } );    
  }

  // Users wants to disconnect Bluetooth
  disconnect() {
    // Update icon
    this.pair.classList.remove( 'connected' );
    this.pair.classList.add( 'ready' );

    // Disconnect
    this.bluetooth.gatt.disconnect();
  }

  // Linear transform
  // Takes a value in one range
  // Maps it to corresponding value in second range
  map( x, in_min, in_max, out_min, out_max ) {
    return ( x - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
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

    // Debug
    console.log( content );
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

}

// Constants
Bean.CHARACTERISTIC = 'a495ff21-c5b1-4b44-b512-1370f02d74de';
Bean.NAME = 'Bean+';
Bean.SERVICE = 'a495ff20-c5b1-4b44-b512-1370f02d74de';

// Let's do this!
let app = new Bean();
