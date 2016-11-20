var ImageHash = ( function() {

  // Variables
  var has_first = false;
  var has_second = false;

  // DOM references
  var working_space = document.querySelector( '.working_space' );
  var first_compare = document.querySelector( '.first_compare' );
  var second_compare = document.querySelector( '.second_compare' );
  var first_image = document.querySelector( '.first_image' );
  var second_image = document.querySelector( '.second_image' );

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
    working_space.width = 8;
    working_space.height = 8;

    // Drawing context
    context = working_space.getContext( '2d' );

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

  // Compare two images
  // Uses various approaches
  var compare = function() {
    var first_hash = null;
    var hamming = null;
    var second_hash = null;

    // Two images to compare
    if( has_first && has_second ) {

      // **
      // Average
      // **

      // Get average hash
      first_hash = average( first_image );
      second_hash = average( second_image );

      // Debug
      console.log( first_hash );
      console.log( second_hash );

      // Distance
      // How different are the images
      hamming = distance( first_hash, second_hash );

      // Debug
      console.log( 'Distance: ' + hamming );

      // **
      // Difference
      // **

      // Get difference hash
      first_hash = difference( first_image );
      second_hash = difference( second_image );

      // Debug
      console.log( first_hash );
      console.log( second_hash );

      // Distance
      // How different are the images
      hamming = distance( first_hash, second_hash );

      // Debug
      console.log( 'Distance: ' + hamming );

      // **
      // Perceptual
      // **

      // Get perceptual hash
      first_hash = perceptual( first_image );
      second_hash = perceptual( second_image );

      // Debug
      console.log( first_hash );
      console.log( second_hash );

      // Distance
      // How different are the images
      hamming = distance( first_hash, second_hash );

      // Debug
      console.log( 'Distance: ' + hamming );
    }
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
    working_space.width = 9;
    working_space.height = 8;

    // Drawing context
    context = working_space.getContext( '2d' );

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

  // Discrete cosine transform
  var dct = function( N, f ) {
    // Initialize coefficients
    var c = new Float64Array( N );
    
    for( var i = 1; i < N; i++ ) {
      c[i] = 1;
    }
    
    c[0] = 1 / Math.sqrt( 2 );
    
    // Output
    var F = new Float64Array( N * N );

    // Lookup table
    // Because it's O(n^4)
    var entries = ( 2 * N ) * ( N - 1 );
    var COS = new Float64Array( entries );

    for( var i = 0; i < entries; i++ ) {
      COS[i] = Math.cos( i / ( 2 * N ) * Math.PI );
    }

    // the core loop inside a loop inside a loop...
    for( var u = 0; u < N; u++ ) {
      for( var v = 0; v < N; v++ ) {
        var sum = 0;

        for( var i = 0; i < N; i++ ) {
          for( var j = 0; j < N; j++ ) {
            sum += COS[( 2 * i + 1 ) * u] 
              * COS[( 2 * j + 1 ) * v] 
              * f[N * i + j];
          }
        }

        sum *= ( ( c[u] * c[v] ) / 4 );
        F[N * u + v] = sum;
      }
    }

    return F;
  };

  // Hamming distance
  // Difference between two hashes
  var distance = function( first_hash, second_hash ) {
    var result = 0;

    for( var i = 0; i < first_hash.length; i++ ) {
      if( first_hash.charAt( i ) != second_hash.charAt( i ) ) {
        result = result + 1;
      }  
    }

    return result;
  };

  // Median calculation
  var median = function( pixels ) {
    var duplicate = null;
    var high = null;
    var low = null;
    var middle = null;
    var result = null;

    duplicate = pixels.concat();
    duplicate.sort( function( a, b ) {
      if( a > b ) {
        return -1;
      } else if( a < b ) {
        return 1;
      }

      return 0;
    } );

    middle = Math.floor( duplicate.length / 2 );
  
    if( duplicate.length % 2 ) {
      result = duplicate[middle];
    } else {
      low = duplicate[middle];
      high = duplicate[middle + 1];
      result = ( low + high ) / 2;
    }
    
    return result;
  };

  // Perceptual
  // https://raw.githubusercontent.com/naptha/phash.js/master/phash.js
  var perceptual = function( original ) {
    // Debug
    console.log( 'Perceptual hash.' );

    // Size working area
    // Larger sample area
    working_space.width = 32;
    working_space.height = 32;

    // Drawing context
    context = working_space.getContext( '2d' );

    // Scale the image
    context.drawImage( original, 0, 0, 32, 32 );
    
    var size = 32;
    var smallerSize = 8;

    // ctx.drawImage(img, 0, 0, size, size);
    // context.drawImage(img, 0, -size, size, size * 3);
    var im = context.getImageData( 0, 0, 32, 32 );

    // Reduce color
    var vals = new Float64Array( 32 * 32 );

    for(var i = 0; i < 32; i++){
      for(var j = 0; j < 32; j++){
        var base = 4 * (32 * i + j);
        vals[32 * i + j] = 0.299 * im.data[base] + 
          0.587 * im.data[base + 1] + 
          0.114 * im.data[base + 2];
      }
    }

    // Compute DCT
    var dctVals = dct(32, vals);

    // Reduce the DCT
    // Keep top-left
    // Lowest frequencies
    var vals = []

    for(var x = 1; x <= smallerSize; x++){
      for(var y = 1; y <= smallerSize; y++){
        vals.push(dctVals[32 * x + y])
      }
    }

    // Average value
    // Mean using top-left
    var median = vals.slice(0).sort(function(a, b){
      return a - b
    })[Math.floor(vals.length / 2)];

    // Reduce to hash
    var result = vals.map(function(e){
      return e > median ? '1' : '0';
    }).join('');

    return result;
  };

  // Called when dropped
  // Prevent default
  // Check for image
  // Load image
  var doDrop = function( evt ) {
    // Debug
    console.log( 'Dropped.' );
    console.log( evt );
    console.log( evt.dataTransfer.files[0] );   

    // Stop default browser behavior
    // Which will try to display the content
    evt.stopPropagation();
    evt.preventDefault();

    // We have an image
    if( evt.dataTransfer.files[0].type.indexOf( 'image' ) >= 0 ) {
      this.style.backgroundImage = 'url( assets/' + evt.dataTransfer.files[0].name + ' )';

      if( this.classList.contains( 'first_compare' ) ) {
        first_image.src = 'assets/' + evt.dataTransfer.files[0].name;
        has_first = true;
      } else {
        second_image.src = 'assets/' + evt.dataTransfer.files[0].name;
        has_second = true;        
      }
    }

    // Remove border from drop target
    // Show ready for additional drops
    this.classList.remove( 'drop_ready' );
    this.classList.add( 'drop_waiting' );    
  };

  // Called when dragging
  // Show ready to receive
  var doDragEnter = function( evt ) {
    // Debug
    console.log( 'Drag enter.' );
        
    // Visual change of drop target
    // Show user that we are NOT ready
    this.classList.remove( 'drop_waiting' );
    this.classList.add( 'drop_ready' );
  };

  // Called when dragging
  // Show NOT ready to receive
  var doDragLeave = function( evt ) {
    // Debug
    console.log( 'Drag leave.' );
        
    // Visual change of drop target
    // Show user that we are NOT ready
    this.classList.remove( 'drop_ready' );
    this.classList.add( 'drop_waiting' );
  };

  // Called when dragging
  // Prevent default
  var doDragOver = function( evt ) {
    // Debug
    console.log( 'Dragged in ...' );
        
    // Stop default browser behavior    
    evt.stopPropagation();
    evt.preventDefault();

    // Prepare to drop
    evt.dataTransfer.dropEffect = 'copy';
  };

  // Called when image is loaded
  // Perform hashing
  var doImageLoad = function() {
    // Debug
    console.log( 'Loaded.' );

    // Compare
    compare();
  };

  // Listeners
  // Local drag and drop
  first_compare.addEventListener( 'dragover', doDragOver );
  first_compare.addEventListener( 'dragenter', doDragEnter );
  first_compare.addEventListener( 'dragleave', doDragLeave );
  first_compare.addEventListener( 'drop', doDrop );

  second_compare.addEventListener( 'dragover', doDragOver );
  second_compare.addEventListener( 'dragenter', doDragEnter );
  second_compare.addEventListener( 'dragleave', doDragLeave );
  second_compare.addEventListener( 'drop', doDrop );

  // Image loaded
  first_image.addEventListener( 'load', doImageLoad );
  second_image.addEventListener( 'load', doImageLoad );  

  // Reveal
  return {};

} )();
