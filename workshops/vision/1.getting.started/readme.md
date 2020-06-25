# Getting Started

In order for a computer to have vision, it needs to have some fashion of representation of the physical world. The most readily accessible means to capture a representation of the physical world for most people is a camera - usually on their phone, laptop, or other computing device.

Computer vision using a camera will typically process still images, or still images from video feeds. To do this using Web Standards, we will have three steps. 

The first step is providing a placeholder for the video. The second step is to get access to the camera on the device, and use that as the video feed. Finally, we need to get access to the pixels of the video feed, which can be accomplished using a canvas element.

## :star: Document Elements

Placing a video element into an HTML page is just like placing an image or any other tag. The video tag can react to a number of attributes, most of which we will ignore during this workshop. While we are getting started, we will set the "width" and "height" attributes to fixed values.

    <video width="320" height="240"></video>
    <canvas width="320" height="240"></canvas>

A canvas element is how we will get content from the video stream for processing. Depending on your use-case for computer vision it is not uncommon to hide one or the other tag from the user. Rarely do you need two visible copies of a video stream coming from a camera.

## :star: Camera Stream

Camera access comes to us via the Stream API, which you may also know a "getUserMedia". It was also envisioned as the "device" element at one point. There is actually a lot to this API. You can enumerate the media options on the device allowing you to discover front-facing and environment-facing cameras, different audio inputs, and more.

For the purposes of getting started, in this workshop, we are going to make the assumption that your device has a camera on it. We will come back to multiple cameras later in the workshop.

    this.video = document.querySelector( 'video' );
    
    navigator.mediaDevices.getUserMedia( {audio:  false, video:  true} )
    .then( ( stream ) => {
      this.video.srcObject = stream;
      this.video.play();
    } )
    .catch( ( error ) => {
      console.log( error );
    } );

The Stream API allows us to get video from the camera as a stream, but then we need some place to put it. That is where the video element comes into play. The first step then is to get a reference to that video element.

Once we have that video element, we can invoke the Stream API. This is a promise-based API, returning the camera video feed as a stream object. We can then set that stream as the source for the video element, and start playing the content.

## :star: Canvas and Context

The "canvas" element is generally more well-known for the ability to draw inside a document. It is core to amazing charts, 3D content, and more. That drawing capability will come in handy in capturing snapshots from the video stream. We will want to access the canvas element from various places in our code, so get a reference to it at a scope where it will be visible across functions.

	  this.video = document.querySelector( 'video' );
  	this.canvas = document.querySelector( 'canvas' );
	  this.context = this.canvas.getContext( '2d' );
	
The context object is really what makes canvas work - it is where all the drawing APIs are defined. There are both "2D" and "3D" contexts that can be used with the canvas context today. We are interested in the "2d" context. We will come back to this in a moment, but for now, back to that snippet of code that allowed us to place the camera stream into the video element.

    navigator.mediaDevices.getUserMedia( {audio:  false, video:  true} )
    .then( ( stream ) => {
      this.video.srcObject = stream;
      this.video.play();
      this.detect();
    } )
    .catch( ( error ) => {
      console.log( error );
    } );

Once we have the stream from the camera, we assigned it as the source of the video element, and then started playing. Immediately following those steps we are going to add a call to a function. The responsibility of that function will be to take the current contents of the video element, and draw it onto the canvas element.

    detect() {
      this.context.drawImage( this.video, 0, 0, this.canvas.width, this.canvas.height );
      requestAnimationFrame( () => { return  this.detect(); } );
    }

> This function is really the hook for our computer vision work, mainly because once content is in the canvas, we can get access to the pixels of that canvas and perform further processing. More on that in a moment.

The first line in this function does that drawing work. The second line uses "requestAnimationFrame" to continue drawing in sync with the browsers repainting thread. We are not doing any additional work at this point, which should yield a frame rate on the canvas that mirrors exactly (as far as the eye can tell), the camera stream in the video element.

## :star: Image Processing

Now let us have some fun with the pixels on the canvas. The first step for many computer vision algorithms is actually to remove color from the source image. This is because color often represents noise to those algorithms and makes it harder to perform object detection and the likes. 

    detect() {
      this.context.drawImage( this.video, 0, 0, this.canvas.width, this.canvas.height );
      let  pixels = this.context.getImageData( 0, 0, this.canvas.width, this.canvas.height );
      
      for( let  p = 0; p < pixels.data.length; p += 4 ) {
        let  average = Math.round( 
          ( pixels.data[p] + pixels.data[p + 1] + pixels.data[p + 2 ] ) / 3 
        );
        
        pixels.data[p] = average;
        pixels.data[p + 1] = average;
        pixels.data[p + 2] = average;
      }
      
      this.context.putImageData( pixels, 0, 0 );
      requestAnimationFrame( () => { return  this.detect(); } );
    }

Getting the pixel values from the canvas involves calling "getImageData()" on the "context" object. The result is a single dimension array. That might seem odd given that we are working with a two-dimension image, but is the expected format for most image processing algorithms. There will be four values - red, green, blue, alpha - for each pixel. The means that the length of the pixel array will be "width x height x 4".

There are a few ways to make an image grayscale. The easiest is to average the colors present in the pixels, and then make that average value the value for the red, green, and blue values of the pixel. When averaging you will likely end up with a fractional value, so be sure to round the value to a whole number.

> It should be noted that we are using a 320x240 source image for this exercise. That is 76,800 iterations to modify all the pixels. Surprisingly the impact on frame rate is negligible. Depending on the types of calculations performed, and the processing speed of the machine, I have been able to close in on one-million iterations without dropping frame rate below 12 frames per second (fps).

With all the manipulation done, we need to put the results back into the canvas. This is accomplished with a call to "putImageData()" on the "context" object.

When run in the browser, we will now have the video element displaying the full color stream from the camera, and a canvas element displaying a grayscale version. This is the boilerplate for how computer vision libraries work.

