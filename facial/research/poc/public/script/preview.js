var Preview = ( function( selector ) {

  // Constants
	var EVENT_DETECT = 'preview_detect';
	var PATH_DETECT = 'api/visual/detect';
	var SIZE_MAXIMUM = 800;

  // Properties
	var canvas = null;
	var context = null;
  var crop = null;
	var element = null;
	var face = null;
	var original = null;
	var reader = null;
  var subscribers = null;
	var xhr = null;

  /*
   * Observer
   */

	// Called by observers to add event notifications
  var addEventListener = function( name, callback ) {
    if( subscribers == null ) {
      subscribers = [];
    }
    
    // Track observers
    // Events they want
    // Callbacks to trigger    
    subscribers.push( {
      callback: callback,
      name: name
    } );
  };

  // Called to send a notification event
  // Listeners for event get specified data
  var emit = function( name, data ) {
    for( var s = 0; s < subscribers.length; s++ ) {
      if( subscribers[s].name == name ) {
        subscribers[s].callback( data );
      }
    }
  };    

  /* 
   * Events
   */

	var doDetectLoad = function() {
		var data = null;

		console.log( 'Detect complete.' );
		
		data = JSON.parse( xhr.responseText );
		// console.log( data );

    for( var f = 0; f < data.images[0].faces.length; f++ ) {
      face.width = data.images[0].faces[f].face_location.width;
      face.height = data.images[0].faces[f].face_location.height;
      
      crop.drawImage( 
        canvas, 
        data.images[0].faces[f].face_location.left,
        data.images[0].faces[f].face_location.top,
        data.images[0].faces[f].face_location.width,
        data.images[0].faces[f].face_location.height,
        0, 
        0,
        data.images[0].faces[f].face_location.width,
        data.images[0].faces[f].face_location.height        
      );
      
      data.images[0].faces[f].avatar = face.toDataURL( 'image/jpeg' );
      data.images[0].hash = Perceptual.hash( Perceptual.AVERAGE_HASH, canvas );
    }

    emit( EVENT_DETECT, data );

		xhr.removeEventListener( 'load', doDetectLoad );
		xhr = null;
	};

	var doDragOver = function( event ) {	
		event.preventDefault();
		event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
	};

	var doDrop = function( event ) {
		console.log( 'Dropped.' );

		event.preventDefault();
		event.stopPropagation();

  	reader = new FileReader();
  	reader.addEventListener( 'load', doReaderLoad );
  	reader.readAsDataURL( event.dataTransfer.files[0] );		
	};

	var doOriginalLoad = function() {
		var blob = null;
		var form = null;
		var jpeg = null;

    // Debug
		console.log( 'Original loaded.' );		
		console.log( original.clientWidth + ', ' + original.clientHeight );

    // Landscape
    // Portrait
		if( original.clientWidth >= original.clientHeight ) {
			canvas.width = SIZE_MAXIMUM;
			canvas.height = SIZE_MAXIMUM * ( original.clientHeight / original.clientWidth );
		} else {
      canvas.height = SIZE_MAXIMUM;
      canvas.width = SIZE_MAXIMUM * ( original.clientWidth / original.clientHeight );
		}

		context = canvas.getContext( '2d' );
		context.drawImage( original, 0, 0, canvas.width, canvas.height );

		jpeg = canvas.toDataURL( 'image/jpeg' );
		blob = Utility.toBlob( jpeg );
		
		element.style.backgroundImage = 'url( ' + jpeg + ' )';

		form = new FormData();
		form.append( Utility.FILE_PARAMETER, blob );

		xhr = new XMLHttpRequest();
		xhr.addEventListener( 'load', doDetectLoad );
		xhr.open( 'POST', PATH_DETECT, true );
		xhr.send( form );
	};

	var doReaderLoad = function() {
		console.log( 'File read.' );

    original.src = reader.result;

    reader.removeEventListener( 'load', doReaderLoad );
    reader = null;
	};

  /*
   * Initialize
   */

	console.log( 'Preview.' );

	element = document.querySelector( selector );
	element.addEventListener( 'dragover', doDragOver );
	element.addEventListener( 'drop', doDrop );

	original = document.createElement( 'img' );
	original.style.visibility = 'hidden';
	original.style.position = 'absolute';
	original.addEventListener( 'load', doOriginalLoad );
	element.appendChild( original );

	canvas = document.createElement( 'canvas' );
	canvas.style.visibility = 'hidden';
	canvas.style.position = 'absolute';
	element.appendChild( canvas );

	face = document.createElement( 'canvas' );
	face.style.visibility = 'hidden';
	face.style.position = 'absolute';
	element.appendChild( face );

  crop = face.getContext( '2d' );

	return {
		EVENT_DETECT: EVENT_DETECT,
		addEventListener: addEventListener
	};

} );
