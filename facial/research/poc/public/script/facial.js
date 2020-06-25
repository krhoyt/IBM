var Facial = ( function() {

  // Properties
  var faces = null;
  var people = null;
	var preview = null;

  /*
   * Events
   */

  var doFaceSaved = function( data ) {
    // Debug
    console.log( 'Commit face.' );

    // Commit to server
    // Update list of people
    people.save( data );
  };

  // Called when faces are detected
  // Contains complete detection response
  // Also contains avatar thumbnails
  var doPreviewDetect = function( data ) {
    // Debug
    console.log( 'Preview detect.' );
    console.log( data );

    // Set detected faces
    faces.setData( data );
  };

  /*
   * Initialize
   */

  // Class name
	console.log( 'Facial.' );

  // Known people panel
  people = new People( '.people' );

  // Preview panel
	preview = new Preview( '.preview' );
  preview.addEventListener( preview.EVENT_DETECT, doPreviewDetect );

  // Detected faces panel
  faces = new Faces( '.faces' );
  faces.addEventListener( faces.FACE_SAVED, doFaceSaved );

  // Reveal
	return {};

} )();
