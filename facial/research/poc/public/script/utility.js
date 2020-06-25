var Utility = ( function() {

  // Constants
  var FILE_PARAMETER = 'attachment';  

  // https://goo.gl/a8oFqk
  var toBlob = function( data ) {
    var bytes = null;
    var encoded = null;
    var mime = null;
    var parts = null;

    // Debug
    console.log( 'Convert to blob.' );

    // Separate data URI
    parts = data.split( ',' );

    if( parts[0].indexOf( 'base64' ) >= 0 ) {
      encoded = atob( parts[1] );       
    } else {
      encoded = unescape( parts[1] );
    }

    mime = parts[0].split( ':' )[1].split( ';' )[0];
    bytes = new Uint8Array( encoded.length );

    for( var b = 0; b < encoded.length; b++ ) {
      bytes[b] = encoded.charCodeAt( b );
    }

    return new Blob( [bytes], {type:mime} );
  };  

  // Class name
  console.log( 'Utility.' );  
	
  // Reveal
  return {
    FILE_PARAMETER: FILE_PARAMETER,
    toBlob: toBlob
  };

} )();
