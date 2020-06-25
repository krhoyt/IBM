# Object Detection

In this workshop we have already used computer vision object detection techniques multiple times. Once when detecting faces, and one when detecting character glyphs. Of course, we accomplished these tasks using libraries that largely abstract us from the details. How does object detection actually work? In this section we will dig a little deeper. We will start with tracking colors, then move on to tracking shapes. By the end you will understand how to identify specific shapes such as a company logo.

## Color Primer

Understanding color is an entire discipline unto itself. Earlier in the workshop we saw that getting image data from a canvas element results is a single-dimension array. Each pixel in the array is represented by red, green, blue, and alpha, effectively taking up four indexes per pixel. But red, green, and blue is how computers see, not how humans see.

The human eye is remarkably adaptable. When you look at a red apple, outdoors, on a sunny day, you can tell that it is a red apple. When you take that red apple indoors, and put it under a fluorescent kitchen light, to your eyes, you would still call it red. To a computer however, the red channel will decrease and the blue channel will increase. As the sun sets, our eyes adjust, and the red apple is still red. The lower lighting conditions however will decrease the red, green, and blue channels even further for a computer. Now the values trend closer to black.

If your application is tracking red apples (really just the color, red), this is going to create a problem.

When it comes to computer vision, red, green, and blue (RGB) is horribly inaccurate. For this reason there are entirely different color models, some of which you may have heard about. The hue, saturation, brightness (HSB) model is an example. The International Commission on Illumination (CIE) has put forth several standards as a solution, most notably "[Delta-E](https://en.wikipedia.org/wiki/Color_difference#CIELAB_%CE%94E*)", which are commonly used in computer vision. If color detection is critical to your application "Delta-E" is worth further investigation.

## Color Distance

If you are iterating the pixels of an image, to look for the color red, you are effectively looking for the difference between the current RGB value of the iteration, and the color you are calling "red". Let us use "255, 0, 0" as our red for the purposes of this discussion. As we are iterating the pixels we come across "234, 8, 22". Is that red enough?

You might at first be inclined to just use the red channel, and for some purposes that may work. Again, as lighting changes, red of our pixel will get further away on the red channel from the "255" of our ideal red. A more realistic approach would be to find the distance between the two colors. What is meant by "distance"?

To make a three-dimensional cube, you need three values, width, height, and depth. We might then look at the three values within an RGB color, as a reference for a three-dimensional cube where "width" might be represented by "red", "height" by "green" and "depth" by "blue" with maximum values of 255. Any color would be somewhere inside that cube. Any two colors then would be some linear distance away. What we are effectively looking for then is the distance between two points in a three-dimensional space.

You may remember that the Pythagorean Theorem states a2 + b2 = c2. When you are dealing with two points, this becomes (a1 - a2)2 + (b1 - b2)2 = (c1 - c2)2. Solving for "c" results in SQRT( (a1 - a2)2 + (b1 - b2)2 ). This can then be extended into a three-dimensional space as SQRT( (a1 - a2)2 + (b1 - b2)2 + (c1 - c2)2 ). The result is the distance between two points in a three-dimensional space. Finally, we swap out a, b, and c for red, green, and blue, which gets us SQRT( (r1 - r2)2 + (g1 - g2)2 + (b1 - b2)2 ).

    Math.sqrt( 
      Math.pow( ( r1 - r2 ), 2 ) + 
      Math.pow( ( g1 - g2 ), 2 ) + 
      Math.pow( ( b1 - b2 ), 2 ) 
    );
    
Using our RGB values of 255, 0, 0, and 234, 8, 22 we get:

    Math.sqrt( 
      Math.pow( ( 255 - 234 ), 2 ) + 
      Math.pow( ( 0 - 8 ), 2 ) + 
      Math.pow( ( 0 - 22 ), 2 ) 
    );

The resulting value is 31. An exact match between 255, 0, 0 and 255, 0, 0 would result in zero (0). The complement of a pure red (255, 0, 0) is a pure green (0, 255, 0). The distance between these two values is 360.  Put another way, the Euclidean distance between two RGB colors is smaller the more similar the colors. The results will be in a range of zero (0) - 360. This then allows us to define a threshold value that we consider to be a match.	

## Tracking a Color

In our very first example, we learned how to take a video stream from a web camera, place it onto a canvas, and then iterate through the pixels on that canvas to apply a greyscale effect. At its most basic, tracking a specific color is very similar. The only real difference is that rather than change the pixel values, we will measure their color distance from a given color.

    find() {
      let  closest = 360;

	  this.color = {
	    red: 255,
	    green: 255,
	    blue: 0
	  };
      
      for( let  y = 0; y < this.canvas.clientHeight; y++ ) {
        for( let  x = 0; x < this.canvas.clientWidth; x++ ) {
          let  index = ( ( y * this.canvas.clientWidth ) + x ) * 4;
          let  sample = {
            red:  this.pixels.data[index],
            green:  this.pixels.data[index + 1],
            blue:  this.pixels.data[index + 2]
          };
          let  distance = Math.sqrt( 
            Math.pow( ( this.color.red - sample.red ), 2 ) +
            Math.pow( ( this.color.green - sample.green ), 2 ) +
            Math.pow( ( this.color.blue - sample.blue ), 2 )
          );
          
          if( distance < closest ) {
            closest = distance;
            this.location.x = x;
            this.location.y = y;
          }
        }
      }
    }

As we iterate through the pixel values, we will be looking for the closest color distance (closer to zero). When we find one that is closer than any previous value, we will capture where that is on the canvas. At some point we might choose to highlight that value, move a game avatar to that location, or some other action. 

When we run an application that uses this approach, one of the things you will find is that the color jumps around a lot. This is because the object in the video stream is probably larger than a single pixel. That means there is a number of "close" pixels to choose from. Depending on the lighting some of those pixels will be closer on one iteration than the next.

## Averaging a Color

To smooth things out a bit, we can record all the locations where the color distance is within a given threshold, and then average the results. In order to get an average we will also need to count how many times we encounter colors that are within that threshold. The average location is the sum of all the "x" locations divided by the number of matches, and the sum of all the "y" locations divided by the number of matches.

    find() {
	  let  average = {
        x:  0,
        y:  0,
        count:  0
      };
      
	  this.color = {
	    red: 255,
	    green: 255,
	    blue: 0
	  };      
      this.location = {
	    x: 0,
		y: 0
	  };
  
      for( let  y = 0; y < this.canvas.clientHeight; y++ ) {
        for( let  x = 0; x < this.canvas.clientWidth; x++ ) {
          let  index = ( ( y * this.canvas.clientWidth ) + x ) * 4;
          let  sample = {
            red:  this.pixels.data[index],
            green:  this.pixels.data[index + 1],
            blue:  this.pixels.data[index + 2]
          };
        let  distance = Math.sqrt(
          Math.pow( ( this.color.red - sample.red ), 2 ) +
          Math.pow( ( this.color.green - sample.green ), 2 ) +
          Math.pow( ( this.color.blue - sample.blue ), 2 )
        );
        
        if( distance < Follower.THRESHOLD ) {
          average.x = average.x + x;
          average.y = average.y + y;
          average.count = average.count + 1;
        }
      }
    }
    
    this.location.x = Math.round( average.x / average.count );
    this.location.y = Math.round( average.y / average.count );
   }

The resulting location is now much more consistent, and drawing the results will be much smoother. However, when a second object of similar color is introduced, the average will still be presented. The result is that rendering the results will actually be somewhere between the two objects. 

> An area of exploration not covered in this workshop is tracking each of those objects as individual entities.

## Blob of Color

Rather than tracking individual pixels, we now turn our attention to tracking the whole object. This is referred to as a "blob" of color. This is actually not that different than averaging the pixels. As before, we track the location of a matching pixel within the threshold. However we also expand that location to represent the bounds of a rectangle. When we find a pixel within the threshold we check against the existing rectangle to adjust the size accordingly.

    find() {
      let  average = {
        x:  0,
        y:  0,
        count:  0
      };
      
	  this.color = {
	    red: 255,
	    green: 255,
	    blue: 0
	  };            
      this.location = {
        x: this.canvas.clientWidth,
        y: this.canvas.clientHeight,
        right: 0,
        bottom: 0
      };
      
      for( let  y = 0; y < this.canvas.clientHeight; y++ ) {
        for( let  x = 0; x < this.canvas.clientWidth; x++ ) {
          let  index = ( ( y * this.canvas.clientWidth ) + x ) * 4;
          let  sample = {
            red:  this.pixels.data[index],
            green:  this.pixels.data[index + 1],
            blue:  this.pixels.data[index + 2]
          };
          let  distance = Math.sqrt(
            Math.pow( ( this.color.red - sample.red ), 2 ) +
            Math.pow( ( this.color.green - sample.green ), 2 ) +
            Math.pow( ( this.color.blue - sample.blue ), 2 )
          );
          
          if( distance < Follower.THRESHOLD ) {
            this.location.x = Math.min( this.location.x, x );
            this.location.y = Math.min( this.location.y, y );
            this.location.right = Math.max( this.location.right, x );
            this.location.bottom = Math.max( this.location.bottom, y );
          }
        }
      }
    }

This allows us to track a single object, and can be expanded to allow for tracking of multiple objects as well. When objects come close together we can then choose to merge the rectangles, or keep them separate and track them independently. 

> This iterative approach is relatively naive. A more robust tracking mechanism would find a closely matching pixel, and then start looking around that pixel for similar matches. When found, the process would expand the bounds of the tracking rectangle, and keep looking in the general area. This is called color clustering.

## :star: Tracking.JS Redux

Earlier we used TrackingJS to find faces in a video stream. TrackingJS also includes the ability to track color blobs. The setup here follows the same pattern we saw earlier in setting up the camera and getting the video stream onto a canvas. With that boilerplate in place we will need to instantiate TrackingJS, and start tracking colors. When a blob is detected, we will track that blob and render the bounding rectangle to the canvas.

### Instantiate Tracking.JS

To create a color tracker using TrackingJS we first need to instantiate an instance of its "ColorTracker" class. The constructor of the "ColorTracker" class takes an array of colors that you want to track. Several colors are available by default. We then attach an event listener to the instance to be notified of when a blob of color is detected.

    this.tracker = new  tracking.ColorTracker( ['yellow'] );
    this.tracker.on( 'track', ( evt ) =>  this.doTracking( evt ) );

### Handle Events

The event object on a tracking event is an array of detected blobs. If there are no results, we want to draw nothing. If there are results, we want to store those so they can be drawn on the next iteration of moving the video content to the canvas.

    doTracking( evt ) {
      if( evt.data.length === 0 ) {
        this.swatches = [];
      } else {
        this.swatches = evt.data.slice( 0 );
      }
    }

> In JavaScript, the default approach to assigning variables is "by reference". I would rather not have my drawing of the bounding rectangles messed up by an event in progress, so I clone the values directly using the "Array.slice()" method.

### Start Tracking

Back in our constructor we are now ready to start the tracking process. This is handled by a single call to the "track()" method on the global "tracking" object created when the TrackingJS library is included in the page. The arguments provided are a reference to the video stream, and an instance of the "ColorTracker" class that we want to use.

    tracking.track( this.video, this.tracker );

> If you look at the DOM using a debugger, you can see that TrackingJS sets up its own canvas element on which it performs the detection work. 

### Drawing Results

I treat detection and drawing as two separate processes. The drawing of the video to the canvas is ongoing and in sync with the browsers painting process via "requestAnimationFrame()". When something is detected we store that reference. As the next painting operation take places, we can check for any found color blobs and draw them accordingly.

    detect() {
      this.context.drawImage( this.video, 0, 0 );
      
      for( let  s = 0; s < this.swatches.length; s++ ) {
        this.context.strokeStyle = 'red';
        this.context.strokeRect( 
          this.swatches[s].x, 
          this.swatches[s].y, 
          this.swatches[s].width, 
          this.swatches[s].height 
        );
      }
      
      requestAnimationFrame( () => { return  this.detect(); } );
    }

## Tracking by Geometry

Tracking by color is useful for many applications, bringing you one step closer to [Minority Report](https://pbs.twimg.com/media/CzS9DATVQAApB6q.jpg). However some objects to be tracked lend themselves not to color, but rather by geometry - the shape of the object. Take our OCR example from the earlier lesson. When transcribing from a raw video, any noise in the video, such as fingers holding a piece of paper, will result in poor results. The results would be much better if we could track the piece of paper, a rectangle, and then extract only that area for transcription.

### Reduce the Noise

The general approach to most object tracking with computer vision involves looking for edges within an image source. These are generally defined by colors rapidly shifting from one color to another, specifically from light to dark. The problem with an unprocessed image source is that there are a lot of these sudden shifts that are not actually edges, but just a group of pixels affected by the ambient lighting or other environmental conditions.

To get rid of this noise we can take two steps. The first step is one that you already know how to do from our very first example - grayscale. There is much less of a chance of a sudden color shift if there is no color. The second step to reduce noise may seem counterintuitive - blur the image. A slight blur smooths out the variations from pixel to pixel, while retaining enough variation to still detect edges.

You can do this blur operation manually, as with the greyscale, but there are libraries to help you along the way. The industry standard is [OpenCV](https://opencv.org/), for which there is a [JavaScript port](https://github.com/ucisysarch/opencvjs). OpenCV however weighs in at over 12 Mb which is considerable. OpenCV includes a vast array of computer vision algorithms, many of which may not be needed. Luckily there are lighter weight alternatives such as [JSFeat](https://inspirit.github.io/jsfeat/) weighing in at less than 250 kb.

JSFeat uses the same data structures to model images and their transformations as OpenCV. In order to process transformations, you will first need an instance of an image data structure. This will give you a place to put the processed results, and chain them together as needed.

    this.image = new  jsfeat.matrix_t(
      this.canvas.clientWidth,
      this.canvas.clientHeight,
      jsfeat.U8_t | jsfeat.C1_t
    );

Moving an image source from raw, to greyscale, to blurred then is a matter of getting the raw pixels from the canvas, and running to JSFeat operations. The first operation to greyscale a raw image source takes arguments of the raw pixels from the canvas, the width and height, and the image data structure to place the results.

    this.context.drawImage(
      this.video,
      0,
      0,
      this.canvas.clientWidth,
      this.canvas.clientHeight
    );
    
    this.pixels = this.context.getImageData(
      0,
      0,
      this.canvas.clientWidth,
      this.canvas.clientHeight
    );
    
    jsfeat.imgproc.grayscale(
      this.pixels.data,
      this.canvas.clientWidth,
      this.canvas.clientHeight,
      this.image
    );

When it comes to blurring an image, you can approach this in several manners. You can blur based on horizontal or vertical axis, or both. A Gaussian blur performs the blur on both axis. JSFeat will need to know just how much we want to blur the image source. For object tracking we are just trying to get rid of the noise, so a blur of three pixels will do. The construct used for a blur operation is called a "kernel".

    let  kernel = ( 3 + 1 ) << 1;
    jsfeat.imgproc.gaussian_blur( this.image, this.image, kernel, 0 );

Here we are taking the source image matrix from the greyscale operation, and placing the results back into that same structure. We also pass the blur kernel to be used. To get the JSFeat image structure back into a canvas "ImageData" structure takes a little extra work. 

    render() {
      let  data = new  Uint32Array( this.pixels.data.buffer );
      let  alpha = ( 0xff << 24 );
      let  size = this.image.cols * this.image.rows;
      let  index = 0;
      
      while( --size >= 0 ) {
        index = this.image.data[size];
        data[size] = alpha | ( index << 16) | ( index << 8 ) | index;
      }
      
      this.context.putImageData( this.pixels, 0, 0 );
    }

The reason for this extra work is that often with computer vision, you are interested in the data structures resulting from the operations, not in rendering the actual results. In this case, just so we can see the effects of the operations, we will render out the results.

### Canny Edge Detection

With the noise in the image greatly reduced, we can now look for the edges proper. The most common approach to finding the edges is called "Canny Edge Detection". The result of a Canny is a binary image - black and white. The edges will be white, and anything not considered an edge will be black.

    jsfeat.imgproc.grayscale(
      this.pixels.data,
      this.canvas.clientWidth,
      this.canvas.clientHeight,
      this.image
    );
    
    let  kernel = ( 3 + 1 ) << 1;
    jsfeat.imgproc.gaussian_blur( this.image, this.image, kernel, 0 );
    
    jsfeat.imgproc.canny( this.image, this.image, 20, 40 );
    jsfeat.imgproc.dilate( this.image, this.image );

Notice that we are still working with the in-memory data structure. We can also put a little emphasis on the detected edges by "dilating" them slightly. The resulting binary image will clearly highlight edges, but we are still just image processing at this point. We do not really have any geometric data to analyze.

### Finding Shape Contours

The goal now is to take the pixels and turn them into a geometric representation. This is called finding the shape contours. JSFeat does not include shape contours by default. There is an open pull request that adds this feature however, which we can use. The reason the pull request has not been merged is because the image data structure uses different property names for the width and height. This is easy enough to remedy. If you are working off the clone of this workshop repository, I have rolled those changes into JSFeat.

    jsfeat.imgproc.grayscale(
      this.pixels.data,
      this.canvas.clientWidth,
      this.canvas.clientHeight,
      this.image
    );
    
    let  kernel = ( 3 + 1 ) << 1;
    jsfeat.imgproc.gaussian_blur( this.image, this.image, kernel, 0 );
    
    jsfeat.imgproc.canny( this.image, this.image, 20, 40 );
    jsfeat.imgproc.dilate( this.image, this.image );
    
    if( !this.image.width ) {
      this.image.width = this.image.cols;
      this.image.height = this.image.rows;
    }
    
    this.contours = CV.findContours( this.image, [] );

### Approximate Polygons

Now that we have a geometric representation of the edges, we can reduce the points to specific polygons. Again, this feature is not part of JSFeat directly, but that is available as a pull request. For the purposes of this workshop, I have included the additional functionality.

    jsfeat.imgproc.grayscale(
      this.pixels.data,
      this.canvas.clientWidth,
      this.canvas.clientHeight,
      this.image
    );
    
    let  kernel = ( 3 + 1 ) << 1;
    jsfeat.imgproc.gaussian_blur( this.image, this.image, kernel, 0 );
    
    jsfeat.imgproc.canny( this.image, this.image, 20, 40 );
    jsfeat.imgproc.dilate( this.image, this.image );
    
    if( !this.image.width ) {
      this.image.width = this.image.cols;
      this.image.height = this.image.rows;
    }
    
    this.contours = CV.findContours( this.image, [] );
    
    for( let  c = 0; c < this.contours.length; c++ ) {
      this.contours[c] = CV.approxPolyDP( 
        this.contours[c], 
        this.contours[c].length * 0.03 
      );
    }

For each of the contours, we now have an array of polygons - and polygons are something we can further evaluate to determine shape. 

### Finding the Rectangles

Rectangles have certain properties that allow us to further refine our results. First is that a rectangle will have four points (corners). Those corners will have roughly ninety (90) degree angles. In this case we expect the rectangle to be roughly horizontal, or to have minimal rotation. In the case of detecting a sheet of paper with some text (OCR), we can also look to make sure that the area of the rectangle takes up a given amount of space of the viewport.

In order to evaluate the width and height of a polygon (and thus angles and area), we need to ensure that the points representing the corners fall in a certain order. For example, in CSS, the "margin" style can be specified using "margin: 10px 0 5px 10px". In this situation the value are top, right, bottom, left. One way to approach this is to determine the center of the points, and then determine the angle of the tangent between the center and each of the given points. That angle will be zero (0) to 360 in a clockwise orientation.

    static order( polygon ) {
      let center  =  polygon.reduce( ( reference, point ) => {
        return {
          x: reference.x + point.x / polygon.length,
          y: reference.y + point.y / polygon.length
        };
      }, {x: 0, y: 0} );
      
      polygon  =  polygon.sort( ( a, b ) => {
        let tana = Math.atan2( ( a.y - center.y ), ( a.x - center.x ) );
        let tanb = Math.atan2( ( b.y - center.y ), ( b.x - center.x ) );
        
        if( tana < tanb ) return -1;
        if( tanb < tana ) return 1;
        return  0;
      } );
      
      return  polygon;
    }

Angle detection for those corners, and the rotation of the rectangle itself are effectively trigonometric functions. As this is not a course on trigonometry, I have pulled those functions into a separate library that is included in the page. Putting everything into action then, and finding the piece of paper in the viewport of the video is as follows.

	let remove = [];
	
    for( let  c = 0; c < this.contours.length; c++ ) {
      if( this.contours[c].length != 4 ) {
        remove.push( c );
        continue;
      }
      
      this.contours[c] = Rectangles.order( this.contours[c] ).splice( 0 );
      
      if( !Rectangles.angles( this.contours[c] ) ) {
        remove.push( c );
        continue;
      }
      
      let rotation = Math.atan2( 
        this.contours[c][1].y - this.contours[c][0].y, 
        this.contours[c][1].x - this.contours[c][0].x ) * ( 180 / Math.PI );
        
      if( rotation > ( 0 + Rectangles.ROTATION_VARIATION ) ||
        rotation < ( 0 - Rectangles.ROTATION_VARIATION ) ) {
        remove.push( c );
        continue;
      }
      
      let width = this.contours[c][1].x - this.contours[c][0].x;
      let height = this.contours[c][2].y - this.contours[c][0].y;
      let area = ( width * height ) / ( this.canvas.clientWidth * this.canvas.clientHeight );
      
      if( area > Rectangles.AREA_MAXIMUM || area < Rectangles.AREA_MINIMUM ) {
        remove.push( c );
      }
    }
    
    for( let  r = 0; r < remove.length; r++ ) {
      this.contours.splice( remove[r] - r, 1 );
    }

Note that there are two passes of our polygons. On one pass we are looking for the polygons that do not match our criteria. We do not remove them at that point as we do not want to modify the array of polygons that we are iterating. Rather we keep track of which indexes need to be removed, and then the second pass takes care of removing those polygons that do not match. With any luck we will be down to a single polygon which we can then draw onto the screen. Or in the case of our OCR objective, we can use the result to extract only the content in which we are interested in processing.

> Two terms that come up frequently in computer vision are "scale invariant" and "rotation invariant". The term "invariant" effectively means that the algorithm does not care. So in the case of "scale invariant" the algorithm does not care about the size of the feature to be detected. The term "rotation invariant" means that the algorithm does not care about how the input data is rotated. We will explore these terms more when we get to the section of the workshop focused on reading barcodes.

### OCR Redux

If you will recall from our OCR exercise, TesseractJS requires an image source on which to process. That image source can be a variety of elements, but we have been using an image element. What we need now is to get from our polygon isolation, to an image element.

The first step in getting to an image element is having a place from which to draw the pixels. For that we will need to add a canvas to the DOM. The canvas will not be drawn in the DOM, it merely needs to be around for us to use.

The results from the polygon search may not be a perfect rectangle, but the canvas will need to be a perfect rectangle. For this we can determine the width and height of the polygon and use that as the size for our canvas. The canvas context allows us to draw from one element onto the canvas. In this case we can draw the contents of the discovered polygon onto the second canvas using "drawImage()". 

From here we can get the pixels from the canvas encoded as an image, and place them into an image element. That gives us the content to perform OCR using TesseractJS. While all of that sounds really complex, it boils down to a few lines of code.

    this.sized.width = this.last[1].x - this.last[0].x;
    this.sized.height = this.last[2].y - this.last[0].y;
    this.sizing.drawImage( 
      this.canvas, 
      this.last[0].x, 
      this.last[0].y, 
      this.sized.clientWidth, 
      this.sized.clientHeight, 
      0, 
      0, 
      this.sized.clientWidth, 
      this.sized.clientHeight 
    );
    
    this.sample.src = this.sized.toDataURL();

Just as in our previous OCR work, when the image loads, we will get an event, and we can then perform OCR.  Tapping into Watson Text-to-Speech (TTS) we can then have the browser speak the resulting text.

    doImageLoad( evt ) {
      Tesseract.recognize( this.sample, {lang:  'eng'} )
      .then( ( result ) => {
        let  phrase = '';
        
        for( let  w = 0; w < result.words.length; w++ ) {
          if( result.words[w].confidence > Geometry.CONFIDENCE ) {
            phrase = phrase + ' ' + result.words[w].text;
          }
        }
        
        WatsonSpeech.TextToSpeech.synthesize( {
          text:  phrase.trim(),
          token:  this.token
        } );
      } );
    }

