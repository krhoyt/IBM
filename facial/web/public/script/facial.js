class Facial {
  constructor() {
    // Current classifier
    // Poling for build status
    this.classifier = null;
    this.polling = null;

    // Home screen
    this.home = new HomeScreen();
    this.home.addEventListener( HomeScreen.EVENT_ADD, ( evt ) => this.doHomeAdd( evt ) );
    this.home.addEventListener( HomeScreen.EVENT_BUILD, ( evt ) => this.doHomeBuild( evt ) );
    this.home.addEventListener( HomeScreen.EVENT_EDIT, ( evt ) => this.doHomeEdit( evt ) );    

    // Add screen
    this.add = new AddScreen();
    this.add.addEventListener( AddScreen.EVENT_CANCEL, ( evt ) => this.doAddCancel( evt ) );
    this.add.addEventListener( AddScreen.EVENT_FORWARD, ( evt ) => this.doAddForward( evt ) );    

    // Edit screen
    this.edit = new EditScreen();
    this.edit.addEventListener( EditScreen.EVENT_CANCEL, ( evt ) => this.doEditCancel( evt ) );    
    this.edit.addEventListener( EditScreen.EVENT_COMPLETE, ( evt ) => this.doEditComplete( evt ) );        

    // Status indicator
    this.training = document.querySelector( 'div.status' );

    // Get classifier from server
    fetch( Facial.PATH_CLASSIFIERS )
    .then( ( response ) => {return response.json();} )
    .then( ( data ) => {
      let index = 0;

      for( index = 0; index < data.classifiers.length; index++ ) {
        if( data.classifiers[index].classifier_id === Facial.CLASSIFIER_ID ) {
          break;
        }
      }

      // Classifier has been constructed
      if( data.classifiers.length > 0 ) {
        this.classifier = data.classifiers[index].classifier_id;

        // Check for status
        // Reflect in user interface
        if( data.classifiers[index].status == 'training' ) {
          this.status();
        }
      }
    } );    
  }

  // Check the status of training
  // Polling
  status() {
    // Ask server for latest
    fetch( Facial.PATH_STATUS + this.classifier )
    .then( ( response ) => {return response.json();} )
    .then( ( data ) => {
      // Debug progress
      console.log( data );

      // Classifier being trained
      // Show user interface indicator
      if( this.polling === null ) {
        this.training.style.display = 'block';
        this.polling = setInterval( this.status.bind( this ), Facial.POLLING_RATE );
      } else if( data.status != 'training' ) {
        // No longer training
        // Clear the interval for polling
        clearInterval( this.polling );
        this.polling = null;
        this.training.style.display = 'none';
      }
    } );
  }

  // Cancel add screen
  doAddCancel( evt ) {
    this.add.hide();
    this.home.show();
    this.add.clear();
  }

  // Move from add to edit screen
  doAddForward( evt ) {
    this.add.hide();
    this.edit.setName( this.add.getName() );
    this.edit.show();
    this.add.clear();
  }

  // Edit screen cancelled
  doEditCancel( evt ) {
    this.edit.hide();
    this.edit.clear();
    this.home.show();
  }

  // User is done editing
  // Remove edit screen
  // Show home screen
  doEditComplete( evt ) {
    this.edit.hide();
    this.edit.clear();
    this.home.existing();
    this.home.show();
  }

  // User wants to add a class
  doHomeAdd( evt ) {
    this.home.hide();
    this.add.show();
  }

  // Start building custom classifier
  doHomeBuild( evt ) {
    if( this.polling != null ) {
      clearInterval( this.polling );
    }

    // Debug classifier ID
    console.log( evt.classifier_id );

    // Store classifier ID
    this.classifier = evt.classifier_id;

    // Start checking status
    this.status();
  }

  // User wants to edit a class
  doHomeEdit( evt ) {
    this.home.hide();
    this.edit.load( evt );
    this.edit.show();
  }
}

// Constants
Facial.CLASSIFIER_ID = 'faces_1568032002'
Facial.POLLING_RATE = '60000';
Facial.PATH_CLASSIFIERS = '/api/watson/classifiers';
Facial.PATH_STATUS = '/api/watson/status/';

// Instantiate application
let app = new Facial();
