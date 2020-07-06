class Camera {
  
  constructor( path ) {
    // Video element
    this.root = document.querySelector( path );
  
    // Ask browser for access
    navigator.getUserMedia( {
        video: true
      }, 
      evt => this.doVideo( evt ), 
      evt => this.doError( evt )
    );
  }

  // Access denied
  // No camera
  doError( evt ) {
    console.log( 'Video error.' );
  }
  
  // Here comes the video
  doVideo( stream ) {
    this.root.src = window.URL.createObjectURL( stream );
  }  

}
