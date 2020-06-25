class Facial {
  constructor() {
    // Landing
    this.main = new LandingScreen();
    this.main.addEventListener( LandingScreen.EVENT_ADD, ( evt ) => this.doMainAdd( evt ) );
    this.main.addEventListener( LandingScreen.EVENT_VIEW, ( evt ) => this.doMainView( evt ) );

    // Detail
    this.detail = new DetailScreen();
    this.detail.addEventListener( DetailScreen.EVENT_BACK, ( evt ) => this.doDetailBack( evt ) );
    this.detail.addEventListener( DetailScreen.EVENT_REMOVE, ( evt ) => this.doDetailRemove( evt ) );

    // Name for new class
    this.name = new NameScreen();
    this.name.addEventListener( NameScreen.EVENT_BACK, ( evt ) => this.doNameBack( evt ) );
    this.name.addEventListener( NameScreen.EVENT_NEXT, ( evt ) => this.doNameNext( evt ) );

    // Record class content
    this.record = new RecordScreen();
    this.record.addEventListener( RecordScreen.EVENT_BACK, ( evt ) => this.doRecordBack( evt ) );
    this.record.addEventListener( RecordScreen.EVENT_SAVED, ( evt ) => this.doRecordSaved( evt ) );

    // Get existing classes
    fetch( Facial.PATH_FACES )
    .then( ( results ) => { return results.json(); } )
    .then( ( data ) => {
      this.main.data = data;
    } );
  }

  // Done viewing detail
  doDetailBack( evt ) {
    this.detail.hide( true );
    this.main.show( true );
  }

  // Remove record
  doDetailRemove( evt ) {
    // From list
    this.main.remove( evt.remove );

    this.detail.hide( true );
    this.main.show( true );
  }
  
  // No new class after all
  doNameBack( evt ) {
    this.name.hide( true );
    this.main.show( true );
  }

  // Supplied name for class
  // Moving on to record
  doNameNext( evt ) {
    this.name.hide();

    this.record.name = evt.name;
    this.record.show();
  }

  // Want to add a class
  doMainAdd( evt ) {
    this.main.hide();

    // Clear previous names
    this.name.clear();
    this.name.show();

    // Clear previous recording
    this.record.clear();
  }

  // Want to view the detail
  doMainView( evt ) {
    // Populate detail
    this.detail.data = evt;

    this.main.hide();
    this.detail.show();
  }

  // Not recording class
  // Maybe changing name
  doRecordBack( evt ) {
    this.record.hide( true );
    this.name.show( true );    
  }

  // Done adding class
  doRecordSaved( evt ) {
    // Add class to list
    // On landing screen
    this.main.append( evt.class, evt.image );

    this.record.hide( true );
    this.main.show( true );
  }
}

// Constants
Facial.PATH_FACES = '/api/storage/classes';

// Main
let app = new Facial();
