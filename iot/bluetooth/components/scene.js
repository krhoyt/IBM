class Scene {
  
  constructor( path ) {
    // Root element
    this.root = document.querySelector( path );  

    // Default logo rotation
    // External properties
    this.x = 0;
    this.y = 0;

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

    // Position camera around logo
    // Point camera at logo
    this.camera.position.x = 0;         
    this.camera.position.y = 0;  
    this.camera.position.z = 150;
    this.camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

    // Renderer for the scene given our view through the camera
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.shadowMap.enabled = true;

    // Light up the scene
    // Mirror camera position with light    
    let light = new THREE.SpotLight( 0xFFFFFF );
    light.position.set( 0, 0, 150 );
    this.scene.add( light );

    // Put scene into the DOM
    this.root.appendChild( this.renderer.domElement );

    // External 3D object
    // IBM logo in STL format
    // Exported from TinkerCAD
    this.logo = new THREE.Object3D();
    
    let loader = new THREE.STLLoader();
    loader.load( '../assets/ibm.stl', geometry => {
      let material = null;

      // White material on logo
      material = new THREE.MeshLambertMaterial( {color: 0xffffff} );

      // Build and scale to fit
      this.logo = new THREE.Mesh( geometry, material );
      this.logo.scale.set( 0.6, 0.6, 0.6 );
      
      // Add object to scene
      this.scene.add( this.logo );

      // Start rendering
      this.render();
    } );    
  }

  // Linear transform
  // Takes a value in one range
  // Maps it to corresponding value in second range
  map( x, in_min, in_max, out_min, out_max ) {
    return ( x - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
  }  

  // Render the scene
  render() {
    // Rotate logo
    // Degrees to radians
    this.logo.rotation.x = this.x * Math.PI / 180;
    this.logo.rotation.y = this.y * Math.PI / 180;

    // Render the scene
    this.renderer.render( this.scene, this.camera );      

    // Keep rendering
    // Browser render pipeline
    requestAnimationFrame( this.render.bind( this ) );     
  }

  // Set rotation of logo
  // Properties are public
  // Grove on the left
  rotate( x, y ) {
    this.x = this.map( y, -270, 270, -90, 90 );
    this.y = this.map( x, -270, 270, -90, 90 );
  }

}
