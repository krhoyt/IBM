var Average = ( function() {

  var THUMBNAIL_SIZE = 8;

  var hash = function( original ) {
    var average = null;
    var canvas = null;
    var context = null;
    var gray = null;
    var pixels = null;
    var resized = null;
    var results = null;  
    var sum = null;

    // Debug
    console.log( 'Average hash.' );

    // Canvas
    canvas = document.querySelector( '.working_space' );

    // Size working area
    canvas.width = THUMBNAIL_SIZE;
    canvas.height = THUMBNAIL_SIZE;

    // Drawing context
    context = canvas.getContext( '2d' );

    // Scale the image
    context.drawImage( original, 0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE );
    
    // Get the resized pixels
    resized = context.getImageData( 0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE );

    // Checkpoint
    console.log( resized );

    pixels = [];
    sum = 0;

    // Desaturate
    // Greyscale
    // Four elements per pixel (RGBA)    
    for( var r = 0; r < resized.data.length; r = r + 4 ) {
      gray = Math.floor( ( 
        Math.max( resized.data[r], resized.data[r + 1], resized.data[r + 2] ) + 
        Math.min( resized.data[r], resized.data[r + 1], resized.data[r + 2] )
      ) / 2 );

      pixels.push( gray );
      sum = sum + gray;
    }

    // Average
    average = Math.floor( sum / pixels.length );

    // Hash holder
    // As string
    results = '';

    // Generage hash
    // Based on average
    for( var p = 0; p < pixels.length; p++ ) {
      if( pixels[p] > average ) {
        results = results + '0';
      } else {
        results = results + '1';
      }
    }

    return results;
  };

  return {
    hash: hash
  }

} )();
