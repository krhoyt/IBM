# Face Detection and Alignment

Human faces follow a common layout. There is a blank space at the top of the head, followed by two inset areas. These inset areas create a darker area when compared to the blank space at the top of the head (the forehead). Moving downward from there is another single shift in contrast placed roughly center between the two previous inset areas. This is the nose. Then there is a slightly broader shift in contrast below that which we call the mouth.

This pattern of shifts in contrast can be reduced to a numerical matrix (array). One way then to look for faces is to look at the pixels in an image and compare against this matrix to see if the pattern emerges. If it does, then there is a good chance we have detected a face. The assembly of this matrix is referred to as [Eigenfaces](https://en.wikipedia.org/wiki/Eigenface) in computer vision terms. The search for the matching matrix is called [Viola-Jones](https://en.wikipedia.org/wiki/Viola%E2%80%93Jones_object_detection_framework), which is used more broadly for object detection in general.

> Facial detection and facial recognition are two separate computer vision problems. At this point we will focus on facial detection. Once we have a grasp on machine learning applications we will move to focus on recognition.

## Tracking.JS

There are a few JavaScript libraries for facial detection. If you are looking for low-level control, I would recommend [JSFeat](https://inspirit.github.io/jsfeat) using the [Haar Cascades](https://en.wikipedia.org/wiki/Haar-like_feature) feature. For our purposes however, general face detection will do just fine. For this, I like to use the [TrackingJS](https://trackingjs.com/) library. TrackingJS is what we will use for this exercise.

### Document Elements

Just as with the previous exercise, we will need both a video element and a canvas element in our document. Some libraries will actually create these for you as needed. Also, as TrackingJS takes care of attaching the camera stream to the video element, the video element will get a few extra attributes to control the playback.

    <video width="640" height="480" preload autoplay loop muted></video>
    <canvas width="640" height="480"></canvas>

### Adding the Library

TrackingJS is not available on a content delivery network (CDN), so we will need to download the library and include it with our application. If you have cloned this workshop, then that work has already been done for you. If you are following this workshop from scratch, then you will want to include the contents of the "build" directory from the TrackingJS download.

    <script  src="lib/tracking-min.js"></script>
    <script  src="lib/data/face-min.js"></script>

### Element References

We will want to get references to the video and canvas elements for use in our application. The video element reference will be passed to TrackingJS. The context of the canvas element will be used to highlight the faces that TrackingJS found in the video stream.

    this.video = document.querySelector( 'video' );
    this.canvas = document.querySelector( 'canvas' );
    this.context = this.canvas.getContext( '2d' );

### :star: Instantiate Tracking

Once included in our document, TrackingJS will show up at the global scope in a namespace called "tracking". Face detection is functionally a special type of object tracking, so we will instantiate an instance of the TrackingJS object tracker, and tell it that we are specifically looking for faces. Depending on your environment, you can tune how the object tracker works. The code example that follows demonstrates using the tuning functions. Last but not least, we start tracking, passing that reference to the video element.

    this.tracker = new  tracking.ObjectTracker( 'face' );
    this.tracker.setInitialScale( 4 );
    this.tracker.setStepSize( 2 );
    this.tracker.setEdgesDensity( 0.1 );
    
    tracking.track( this.video, this.tracker, {camera:  true} );

> You may be wondering "What are 'initial scale' and the other tuning options?" This question is not answered by the documentation. The question has also come up within the repository issues but has never been answered.

### :star: Handle Events

When TrackingJS detects faces it will raise a "track" event. TrackingJS provides an "on()" method for attaching event handlers. The emitted event includes a "data" property which is an array of objects representing a rectangle - one element in the array for each found face. The rectangle objects include "x", "y", "width", and "height" which we can then use to highlight by drawing on the canvas.

    this.tracker.on( 'track', ( event ) => {
      this.context.drawImage( this.video, 0, 0, 640, 480 );
      event.data.forEach( ( rect ) => {
        this.context.strokeStyle = 'yellow';
        this.context.strokeRect( rect.x, rect.y, rect.width, rect.height );
      } );
    } );

> This technique of identifying a specific portion of an image, and focusing in on only that area, will become more important as our computer vision skills progress towards machine learning.

## Face Alignment

Beyond locating a face in an image, you may also want to determine alignment of the face. Practical application of facial alignment can been seen in movies like Avatar, and The Hobbit. Features are extracted from the actor, and applied to a virtual model as needed to present facial expressions. The effect goes a long ways towards realism. Or, you know, you can use it to animate emoji [poop](https://www.theverge.com/2017/9/12/16290210/new-iphone-emoji-animated-animoji-apple-ios-11-update).

One approach to determining face alignment is to use a set of known points on the human face. Unfortunately, the human face is vastly different from person to person. To address this problem there are multiple face databases that can be used. The [MUCT Face Database](http://www.milbo.org/muct/) consists of 3,700+ faces. Manually located on each face are 72 different points that highlight specific facial characteristics (landmarks). The result is a shape model that can be used against various image sources.

### CLM Tracker

The application of the shape model is effectively trying to map a variation of known points to the specified source image. One approach to this is called constrained local model (CLM). There is a JavaScript implementation of CLM called, [CLM Tracker](https://github.com/auduno/clmtrackr). The embedded shape model makes CLM Tracker a bit heavy at 2.4 MB, but serves its purpose well.

### Tracking Hooks

Before calling "getUserMedia()" we will create an instance of the tracker at a scope we can use throughout our logic. After the media device (camera) is attached to the video, and it has started playing, we can initialize and start tracking. We still want the call to "detect()" but we want to initialize the tracking before that first call. Once we call "detect()" we will be at the mercy of the browser rendering loop via the call to "requestAnimationFrame()".

    this.tracker = new  clm.tracker();
    
    navigator.mediaDevices.getUserMedia( {audio:  false, video:  true} )
    .then( ( stream ) => {
      this.video.srcObject = stream;
      this.video.play();
      
      this.tracker.init();
      this.tracker.start( this.video );
      
      this.detect();
    } )
    .catch( ( error ) => {
      console.log( error );
    } );

### Load and Draw Alignment

Now bringing our focus to the "detect()" method, between the painting of the video onto the canvas, and requesting a rendering update from the browser, we will look up the alignment results. One of my favorite architectural decisions of CLM Tracker is that it does not force you into the redraw. The processing is happening all the time, and you access the latest results as stored on a property of the tracker instance.

    detect() {
      this.context.drawImage( this.video, 0, 0, this.canvas.width, this.canvas.height );
      
      if( this.tracker.getCurrentPosition() ) {
        this.tracker.draw( this.canvas );
      }
      
      requestAnimationFrame( () => { return  this.detect(); } );
    }

One of the other nice features of the CLM Tracker library is that it includes a method to do the drawing for you. The shape model is a complex assortment of paths and points, and rather than have to account for drawing them, we can simply pass the canvas reference to the "draw()" method. Alternatively, if you do not want to draw the alignment results, you can get the raw results with a call to "getCurrentPosition()". From there, you might perform additional processing to map the results and morph an image - just like Hollywood.

## HeadTrackr

While TrackingJS can tell us where a face is located in an image (or video stream), and CLM Tracker can tell us about the features of a face, one additional piece of information an application may be interested in knowing is the tilt angle of the head itself. A face tracking library that does this is [HeadTrackr](https://github.com/auduno/headtrackr). An example of using HeadTrackr is included in the workshop materials but not covered in the lecture.
