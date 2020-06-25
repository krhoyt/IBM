var Perceptual = ( function() {

  // Constants
  var AVERAGE_HASH = 'average_hash';
  var DIFFERENCE_HASH = 'difference_hash';

  // Properties
  var canvas = null;

  /*
   * Methods
   */

  // Average hash
  var average = function( original ) {
    var context = null;
    var gray = null;
    var mean = null;
    var pixels = null;
    var resized = null;
    var results = null;  
    var sum = null;

    // Debug
    console.log( 'Average hash.' );

    // Size working area
    canvas.width = 8;
    canvas.height = 8;

    // Drawing context
    context = canvas.getContext( '2d' );

    // Scale the image
    context.drawImage( original, 0, 0, 8, 8 );
    
    // Get the resized pixels
    resized = context.getImageData( 0, 0, 8, 8 );

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
    mean = Math.floor( sum / pixels.length );

    // Hash holder
    // As string
    results = '';

    // Generage hash
    // Based on average
    for( var p = 0; p < pixels.length; p++ ) {
      if( pixels[p] > mean ) {
        results = results + '0';
      } else {
        results = results + '1';
      }
    }

    return results;
  };

  // Difference hash
  var difference = function( original ) {
    var column_offset = null;
    var context = null;
    var left = null;
    var resized = null;
    var results = null;
    var row_offset = null;    

    // Debug
    console.log( 'Difference hash.' );

    // Size working area
    // Adjacent comparison
    // Requires extra pixel
    canvas.width = 9;
    canvas.height = 8;

    // Drawing context
    context = canvas.getContext( '2d' );

    // Scale the image
    context.drawImage( original, 0, 0, 9, 8 );
    
    // Get the resized pixels
    resized = context.getImageData( 0, 0, 9, 8 );

    // Checkpoint
    console.log( resized );

    results = '';

    for( var row = 0; row < 8; row++ ) {
      // Nine pixels per row
      // Four bytes (RGBA) per pixel
      row_offset = row * 9 * 4;

      // Greyscale
      // Alternatively: Math.floor( ( red + green + blue ) / 3 );
      left = Math.floor( ( 
        Math.max( resized.data[row_offset], resized.data[row_offset + 1], resized.data[row_offset + 2] ) + 
        Math.min( resized.data[row_offset], resized.data[row_offset + 1], resized.data[row_offset + 2] )
      ) / 2 );

      for( var column = 0; column < 8; column++ ) {
        // Four bytes per pixel (RGBA)
        column_offset = row_offset + ( column * 4 );

        right = Math.floor( ( 
          Math.max( resized.data[column_offset], resized.data[column_offset + 1], resized.data[column_offset + 2] ) + 
          Math.min( resized.data[column_offset], resized.data[column_offset + 1], resized.data[column_offset + 2] )
        ) / 2 );

        if( left > right ) {
          results = results + '0';
        } else {
          results = results + '1';
        }

        left = right;        
      }
    }

    return results;
  };

  // Called to hash image
  // Interface to support different hash types
  var hash = function( type, original ) {
    var results = null;

    if( type == AVERAGE_HASH ) {
      results = average( original );
    } else {
      results = difference( original );
    }

    return results;
  };

  /*
   * Initialize
   */

	// Class name
	console.log( 'Perceptual.' );

  // Hash surface
  canvas = document.createElement( 'canvas' );
  canvas.style.visibility = 'hidden';
  canvas.style.position = 'absolute';
  document.body.appendChild( canvas );

	// Reveal
	return {
    AVERAGE_HASH: AVERAGE_HASH,
    DIFFERENCE_HASH: DIFFERENCE_HASH,
		hash: hash
	};
	
} )();
