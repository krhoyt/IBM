class Example {
  constructor() {
    let parent = document.querySelector( 'img' );
    parent.addEventListener( 'load', ( evt ) => this.doParentLoad( evt ) );

    this.gary = new Gary();
    this.gary.addEventListener( 
      Gary.POSITION_CHANGE, 
      ( evt ) => this.doPositionChange( evt ) 
    );
    this.gary.addEventListener( 
      Gary.SIZE_CHANGE, 
      ( evt ) => this.doSizeChange( evt ) 
    );    
  }

  doParentLoad( evt ) {
    this.gary.setSize( 100, 100 );        
    this.gary.setParent( evt.target );
    this.gary.setVisibility( true );
    this.gary.setPosition( 10, 10 );
    // this.gary.setBounds( 0, 0, 300, 300, false );
  }

  doPositionChange( evt ) {
    console.log( evt );
  }

  doSizeChange( evt ) {
    console.log( evt );
  }
}

let app = new Example();
