var People = ( function( selector ) {

  // Constants
  var PATH_SAVE = 'api/visual/save';

  // Properties
  var count = null;
  var element = null;
  var list = null;
  var xhr = null;

  /*
   * Methods
   */

  // Called to persist to server
  var save = function( data ) {
    var blob = null;
    var form = null;

    // Form data
    form = new FormData();

    // Move data over to form
    form.append( 'first', data.first );
    form.append( 'last', data.last );
    form.append( 'gender', data.gender.gender.toLowerCase() );
    form.append( 'original', data.image );
    form.append( 'maximum', data.age.max );
    form.append( 'top', data.face_location.top );
    form.append( 'left', data.face_location.left );
    form.append( 'width', data.face_location.width );
    form.append( 'height', data.face_location.height );
    form.append( 'hash', data.hash );
    
    // Mimimum age
    // May not be present
    if( data.age.min ) {
      form.append( 'minimum', data.age.min );
    }

    // Encode image
    blob = Utility.toBlob( data.avatar );
    form.append( Utility.FILE_PARAMETER, blob );

    // Send to server to save
    xhr = new XMLHttpRequest();
    xhr.addEventListener( 'load', doSaveLoad );
    xhr.open( 'POST', PATH_SAVE, true );
    xhr.send( form );
  };

  /*
   * Events
   */

  var doSaveLoad = function() {
    var data = null;

    // Debug
    console.log( 'Person saved.' );
    console.log( xhr.responseText );

    // Clean up
    xhr.removeEventListener( 'load', doSaveLoad );
    xhr = null;
  };

  /*
   * Initialize
   */

  // Class name
  console.log( 'People.' );  

  // Root element for component
  element = document.querySelector( selector );

  // Count of known people
  count = element.querySelector( 'header > p:nth-of-type( 2 )' );

  // List of known people
  list = element.querySelector( '.list' );

  // Reveal
  return {
    save: save
  };

} );
