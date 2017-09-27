class Slap {
  constructor() {
    // Time delay for display
    this.interval = null;

    // UI reference
    this.slap = document.querySelector( '.slap' );

    // Connect to server
    // Listen for slap event
    this.socket = io();
    this.socket.on( 'slap', evt => this.doMessage( evt ) );
  }

  doMessage( evt ) {
    // Parse
    let message = JSON.parse( evt );
    let parts = message.data.split( ',' );
    let direction = parseInt( parts[0] );

    // Show image for direction of gesture
    switch( direction ) {
      case 0:
        this.slap.style.backgroundImage = 'url( img/slap.right.png )';
        break;

      case 1:
        this.slap.style.backgroundImage = 'url( img/slap.left.png )';
        break;      
    }

    // Display for a limited time
    this.interval = setInterval( () => {
      this.slap.style.backgroundImage = '';
      clearInterval( this.interval );
      this.interval = null;
    }, 2000 );

    // Debug
    console.log( message );
  }
}

// Here we go
let app = new Slap();
