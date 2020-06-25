class Storage {
  constructor() {
    // Bucket list
    this.buckets = new Buckets();
    this.buckets.region = Storage.REGION;
    this.buckets.addEventListener( Buckets.EVENT_ITEM, ( evt ) => this.doBucketsItem( evt ) );
    this.buckets.addEventListener( Buckets.EVENT_MORE, ( evt ) => this.doBucketsMore( evt ) );    
    this.buckets.addEventListener( Buckets.EVENT_ADD, ( evt ) => this.doBucketsAdd( evt ) );

    // Add bucket
    this.folder = new Folder();
    this.folder.addEventListener( Folder.EVENT_SAVE, ( evt ) => this.doFolderSave( evt ) );

    // Bucket menu
    this.bmenu = new Menu( '#buckets-menu' );
    this.bmenu.addEventListener( Menu.EVENT_BUTTON, ( evt ) => this.doBucketsMenu( evt ) );    

    // Object list
    this.objects = new Objects();
    this.objects.addEventListener( Objects.EVENT_BACK, ( evt ) => this.doObjectsBack( evt ) );
    this.objects.addEventListener( Objects.EVENT_MORE, ( evt ) => this.doObjectsMore( evt ) );
    this.objects.addEventListener( Objects.EVENT_ADD, ( evt ) => this.doObjectsAdd( evt ) );

    // Object menu
    this.omenu = new Menu( '#objects-menu' );
    this.omenu.addEventListener( Menu.EVENT_BUTTON, ( evt ) => this.doObjectsMenu( evt ) );

    // Local file browsing
    this.browse = document.querySelector( '#browse' );
    this.browse.addEventListener( 'change', ( evt ) => this.doBrowseChange( evt ) );

    // Loading indicator
    this.loading = new Loading();

    // List buckets
    this.list();
  }

  // Format object size
  // Used on object screen
  // Used on menu screen
  // TODO: Include on bucket screen
  static formatBytes( bytes, decimals = 2 ) {
    if( bytes == 0 ) {
      return "0 B";
    }

    const k = 1000;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    var i = Math.floor( Math.log( bytes ) / Math.log( k ) );

    return parseFloat( ( bytes / Math.pow( k, i ) ).toFixed( decimals ) ) + ' ' + sizes[i];
  }

  // Get bucket list
  list() {
    fetch( Storage.GET_BUCKET_LIST )
    .then( ( response ) => response.json() )
    .then( ( data ) => {
      // Populate list
      // Hide loading indicator
      this.buckets.setData( data );
      this.loading.hide();
    } );
  }

  doBrowseChange( evt ) {
    // Show loading indicator
    this.loading.show();

    // Build form to submit
    // Inclusive of file to upload
    let form = new FormData();
    form.append( 'file', evt.target.files[0] );
    form.append( 'bucket', this.buckets.name );
    form.append( 'name', evt.target.files[0].name );

    // Start file upload
    fetch( Storage.PUT_OBJECT, {
      method: 'PUT',
      body: form
    } )
    .then( response => response.json() )
    .then( ( data ) => {
      // Clear current object list
      // Get fresh object list
      // TODO: Refresh button?
      this.objects.clear();
      return fetch( `${Storage.GET_OBJECT_LIST}?bucket=${this.buckets.name}` );
    } )
    .then( response => response.json() )
    .then( ( data ) => {
      // Populate object list
      // Hide loading indicator
      this.objects.setData( data );
      this.loading.hide();
    } );    
  }

  // Add a bucket (hard folder)
  // TODO: Allow for folders in buckets
  doBucketsAdd( evt ) {
    this.folder.show();
  }

  doBucketsItem( evt ) {
    // Specific bucket was clicked
    // Get object listing for bucket
    fetch( `${Storage.GET_OBJECT_LIST}?bucket=${evt.name}` )
    .then( ( response ) => response.json() )
    .then( ( data ) => {
      // Populate object list
      // Hide loading indicator
      this.objects.setData( data );
      this.loading.hide();
    } );

    // Store bucket name
    // Hide bucket screen
    this.buckets.name = evt.name;
    this.buckets.hide();

    // Place bucket name in header of object screen
    // Show object screen
    this.objects.setTitle( evt.name );
    this.objects.show();

    // Shwo loading indicator
    this.loading.show();
  }

  doBucketsMenu( evt ) {
    // Hide the menu
    this.bmenu.hide();

    // There is really only one option
    // Check just for tidyness
    if( evt.label == Menu.LABEL_DELETE ) {
      // Show the loading indicator
      this.loading.show();

      // Call server to delete
      fetch( `${Storage.DELETE_BUCKET}?bucket=${evt.details.name}`, {
        method: 'DELETE'
      } ) 
      .then( response => response.json() )
      .then( ( data ) => {
        // Remove the item from the list
        // Hide the loading indicator
        this.buckets.remove( data.name );
        this.loading.hide();
      } );       
    }
  }  

  doBucketsMore( evt ) {
    // Massage properties
    // Match expected naming
    evt.modified = evt.created;
    delete evt.created;

    // Show menu for given bucket
    this.bmenu.setDetails( evt );
    this.bmenu.show();
  }  

  doFolderSave( evt ) {
    // Make sure bucket name does not exist
    // Local check
    // TODO: Check against server
    if( this.buckets.exists( evt.name ) ) {
      alert( 'Bucket already exists.' );
      return;
    }

    // Call to add the bucket
    fetch( `${Storage.PUT_BUCKET}?name=${evt.name}`, {
      method: 'PUT'
    } )
    .then( ( response ) => response.json() )
    .then( ( data ) => {
      // Alert if problem
      // Usually because bucket exists
      if( data.error ) {
        alert( data.message );
      }

      // Get bucket listing
      // Refresh
      this.list();
    } );

    // Clear the existing bucket listing
    // Show the loading indicator
    // Hide the bucket (folder) screen
    this.buckets.clear();
    this.loading.show();
    this.folder.hide();
  }

  // Fake browse click
  // Trigger local file browsing
  doObjectsAdd( evt ) {
    this.browse.click();
  }

  doObjectsBack( evt ) {
    // Hide object screen
    // Show bucket screen
    this.objects.hide();
    this.buckets.show();
  }

  doObjectsMenu( evt ) {
    // Hide the menu
    this.omenu.hide();

    switch( evt.label ) {
      // Download object
      case Menu.LABEL_SAVE:
        window.location.href = `${Storage.GET_OBJECT}?bucket=${this.buckets.name}&name=${evt.details.name}`;
        break;      

      // Delete object
      case Menu.LABEL_DELETE:
        // Show the loading indicator
        this.loading.show();

        // Call server to delete
        fetch( `${Storage.DELETE_OBJECT}?bucket=${this.buckets.name}&name=${evt.details.name}`, {
          method: 'DELETE'
        } ) 
        .then( response => response.json() )
        .then( ( data ) => {
          // Remove the item from the list
          // Hide the loading indicator
          this.objects.remove( data.name );
          this.loading.hide();
        } );       
        break;                
    }
  }

  doObjectsMore( evt ) {
    // Show menu for given object
    this.omenu.setDetails( evt );
    this.omenu.show();
  }
}

// Constants
Storage.REGION = 'us-east';

// Endpoints
Storage.DELETE_BUCKET = 'https://openwhisk.ng.bluemix.net/api/v1/web/krhoyt%40us.ibm.com_dev/cos/delete.bucket.all';
Storage.DELETE_OBJECT = 'https://openwhisk.ng.bluemix.net/api/v1/web/krhoyt%40us.ibm.com_dev/cos/delete.object';
Storage.GET_BUCKET_LIST = 'https://openwhisk.ng.bluemix.net/api/v1/web/krhoyt%40us.ibm.com_dev/cos/get.bucket.list';
Storage.GET_OBJECT = 'https://openwhisk.ng.bluemix.net/api/v1/web/krhoyt%40us.ibm.com_dev/cos/get.object';
Storage.GET_OBJECT_LIST = 'https://openwhisk.ng.bluemix.net/api/v1/web/krhoyt%40us.ibm.com_dev/cos/get.object.list';
Storage.PUT_BUCKET = 'https://openwhisk.ng.bluemix.net/api/v1/web/krhoyt%40us.ibm.com_dev/cos/put.bucket';
Storage.PUT_OBJECT = 'https://openwhisk.ng.bluemix.net/api/v1/web/krhoyt%40us.ibm.com_dev/cos/put.object';

// Main
const app = new Storage();
