class HomeScreen extends Observer {
  constructor() {
    // Inherit
    super();

    // Event listener references
    // Stored for programmatic add and remove
    this.doBuildClick = this.doBuildClick.bind( this );
    this.doExistingClick = this.doExistingClick.bind( this );
    this.doTipHide = this.doTipHide.bind( this );
    this.doTipShow = this.doTipShow.bind( this );

    // Element references
    this.root = document.querySelector( 'div.screen:nth-of-type( 1 )' );
    this.browse = document.querySelector( 'div.screen:nth-of-type( 1 ) > div.browse' );
    this.hint = document.querySelector( 'div.screen:nth-of-type( 1 ) > p' );
    this.add = document.querySelector( 'button.add' );
    this.add.addEventListener( 'mouseover', ( evt ) => this.doTipShow( evt ) );
    this.add.addEventListener( 'mouseout', ( evt ) => this.doTipHide( evt ) );    
    this.add.addEventListener( 'click', ( evt ) => this.doAddClick( evt ) );
    this.build = document.querySelector( 'button.build' );
    this.build.addEventListener( 'mouseover', ( evt ) => this.doTipShow( evt ) );
    this.build.addEventListener( 'mouseout', ( evt ) => this.doTipHide( evt ) );  

    // Load existing classes
    this.existing();
  }

  // Check for exsiting classes
  existing() {
    fetch( '/api/storage/classes' )
    .then( ( response ) => {return response.json();} )
    .then( ( data ) => {
      // Show icon for each class
      for( name in data ) {
        let found = false;

        // Make sure class is not already listed
        // Prevents repeats during edit process
        for( let c = 0; c < this.browse.children.length; c++ ) {
          if( this.browse.children[c].getAttribute( 'data-name' ) === name ) {
            found = true;
            break;
          }
        }

        // New class
        if( !found ) {
          // Build class button for edit
          let element = document.createElement( 'button' );
        
          element.style.backgroundImage = `url( 'classifier/${name}/${data[name]}' )`;        
          element.classList.add( 'person' );
          element.setAttribute( 'data-name', name );
          element.setAttribute( 'data-file', data[name] );        
          element.addEventListener( 'mouseover', this.doTipShow );
          element.addEventListener( 'mouseout', this.doTipHide );        
          element.addEventListener( 'click', this.doExistingClick );
          this.browse.insertBefore( element, this.add );
        }
      }

      // Validate screen for user actions
      this.validate();
    } );
  }

  // Hide screen
  hide() {
    this.root.style.display = 'none';
  }

  // Show screen
  show() {
    this.root.style.display = 'flex';
  }

  // Validate to prevent or allow actions
  validate() {
    // Need at least two classes to build
    if( this.browse.children.length > 1 ) {
      this.build.setAttribute( 'data-name', 'Build the classifier' );      
      this.build.classList.remove( 'disabled' );
      this.build.addEventListener( 'click', this.doBuildClick );
    } else {
      this.build.setAttribute( 'data-name', 'Add a face first' );
      this.build.classList.add( 'disabled' );
      this.build.removeEventListener( 'click', this.doBuildClick );
    }
  }

  // User wants to add a new class
  doAddClick( evt ) {
    this.emit( HomeScreen.EVENT_ADD, null );
  }

  // User requesting classifier to build
  doBuildClick( evt ) {
    fetch( '/api/watson/build' )
    .then( ( response ) => {return response.json();} )
    .then( ( data ) => {
      this.emit( HomeScreen.EVENT_BUILD, data );
    } ); 
  }

  // Edit existing class
  // Alternatively remove class entirely
  // Toggle via shift key
  doExistingClick( evt ) {
    if( evt.shiftKey ) {
      // Shift key is present so remove class from server
      fetch( '/api/storage/class/' + evt.target.getAttribute( 'data-name' ), {
        method: 'DELETE'
      } ).then( ( response ) => {return response.json();} )
      .then( ( data ) => {
        // Server complete
        // Remove class from user interface
        evt.target.removeEventListener( 'mouseover', this.doTipShow );
        evt.target.removeEventListener( 'mouseout', this.doTipHide );        
        evt.target.removeEventListener( 'click', this.doExistingClick );
        evt.target.remove();
        this.hint.innerHTML = '';
      } );
    } else {
      // No shift key present
      // Edit contents of class
      this.emit( HomeScreen.EVENT_EDIT, {
        class: evt.target.getAttribute( 'data-name' ),
        file: evt.target.getAttribute( 'data-file' )
      } );
    }
  }
  
  // Hide hints
  doTipHide( evt ) {
    this.hint.innerHTML = '';
  }  

  // Show hints
  doTipShow( evt ) {
    this.hint.innerHTML = evt.target.getAttribute( 'data-name' ) + '.';
  }
}

// Constants
HomeScreen.EVENT_ADD = 'home_add_click';
HomeScreen.EVENT_BUILD = 'home_build_started';
HomeScreen.EVENT_EDIT = 'home_edit_click';
