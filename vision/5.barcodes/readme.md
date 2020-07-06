
# Barcodes

Most times, we as humans, are feeding data into "the machine". Maybe this is a social media post, or the data that results from tracking your day-to-day surfing, or the various systems you may engage with (or even build) at your place of employment. Barcodes (and QR codes) are fascinating because they represent the opposite - they are "the machine" manifesting itself in the physical world. Barcodes were invented in 1952, but it would take another twenty (20) years for them to reach commercial success. Now they are nearly ubiquitous.

> The first commercial barcode (UPC) was on a pack of Wrigley's Chewing Gum in 1974.

## How Barcodes Work

When referring to the Universal Product Code (UPC) that we are so familiar with from the grocery store, all those lines have a very distinct meaning when scanned. 

The first several lines in a UPC (left to right) indicate the thickness of the lines that follow. That is to say that the scanner doesn't know how thick each line will be as that will differ depending on the distance from the scanner. When that first group of lines are encountered, the scanner can then tell how thick each line in the code should be. Both white and black lines count.

From there, the following groups of lines indicate a specific value. Very much like Morse Code, specific combinations of black and white lines (dots and dashes), in a given order, represent specific values. The last group of lines represents a check sum digit to let you know if the values were read correctly. The blank padding around the barcode is important to more rapidly read the contents.

There are dozens of public and private barcode systems used across the globe. UPC and EAN are more common in commercial settings, while Code 93 and others can be found in industrial settings. These are all generally grouped into "1D" barcodes. Only a single line of pixel data is needed to actually retrieve the value. The other category of barcodes, called "2D" includes QR codes, which we will get to later.

## :star: Zebra Crossing

There are a number of libraries for barcode scanning. The most popular is "[Zebra Crossing](https://github.com/zxing/zxing)" which is commonly abbreviated as "ZXing". Originally implemented in Java for Android, ZXing has been ported to many other languages, including [JavaScript](https://github.com/zxing-js/library). ZXing supports many different 1D barcode formats (where documentation permits), as well as a variety of 2D formats including QR codes. The JavaScript port of ZXing even works on mobile devices, which we will get to in a moment.

### Document Elements

ZXing generates the canvas element needed for processing the image data, so all we need to provide is a video element. At that, we do not even need to wire it up to the web camera - ZXing will handle that as well. 

    <video  width="640"  height="480"></video>
    <p></p>

Usually when processing a barcode, we will take some action immediately after decoding the value. A product lookup, for example. The lookup will be displayed in the user interface rather than the barcode value, which most humans do not really care about reading. For our example application we will use a paragraph (p) element to display the decoded value. We will want to have references to both the video element and the paragraph element.

    this.video = document.querySelector( 'video' );
    this.output = document.querySelector( 'p' );

### Instantiate the Reader

When using ZXing you have to decide up front what type of barcode you will be scanning. We will see later how we can toggle that reader instance, but for now, we will start off with a standard 1D barcode reader.

    this.reader = new ZXing.BrowserBarcodeReader();

### Decoding the Content

The ZXing decoding operation is a promise-based call (versus event-driven/observable). The call takes two arguments. The first argument is a reference to the web camera that is to be used. The default is to use the first camera device that can be found. On a mobile device where you may have a front and rear-facing camera, you may want to additionally specify which device you want ZXing to use. The second argument is a reference to the video element to be used.

    this.reader.decodeFromInputVideoDevice( undefined, this.video );

At this point ZXing will get the camera stream, put it into the video, and then start looking for a 1D barcode. All that is left for us is to handle the results.

### Handling the Results

The result value from the decoding operation is the raw content. In the case of a 1D barcode this will generally be a string of integers ("123456789"). In the case of a 2D barcode, there may be more information that you will have to parse for yourself. We will come to 2D barcodes momentarily. For this example, we will place the resulting output into the paragraph element.

    this.reader.decodeFromInputVideoDevice( undefined, this.video )
    .then( ( result ) => {
      this.output.innerHTML = result.text;
      this.output.style.display = 'block';
      
      console.log( result );
    } )
    .catch( ( err ) => {
      console.error( err );
    } );

The "catch" on the promise is important. Without it, the decode will not function. The result in a debug console is an error message for every scan ZXing does that fails - which is several times per second. If you are a shop that has a requirement of no error message outputs, you will have to do some additional digging to figure out how to supress the negative scan results.

### QR Codes

Moving from a 1D barcode to a 2D barcode requires only a single change - the type of reader we instantiate. The decode operation is exactly the same.

    this.reader = new ZXing.BrowserQRCodeReader();

A "QR code" is technically a specific type of 2D barcode. It was invented by Denso Wave in 1994 for use in the automotive industry. The "QR" stands for "quick response", and it carried two major benefits - it could hold more data, and it was "lossy". A "lossy" format when it comes to barcodes means that the computer does not need to decode the entire barcode correctly into order to get all the content it contains.

A QR code specifically can contain a variety of text content depending on the settings when encoded. This ability has been extended by convention to denote specific types of content. Depending on the textual content of the barcode, it can be a contact card, a geolocation coordinate, an email address, or even wifi configuration data. 

Contact card: 

    BEGIN:VCARD
    VERSION:3.0
    N:Kevin Hoyt
    ORG:IBM
    TITLE:Developer Advocate
    URL:http://kevinhoyt.com
    EMAIL:krhoyt@us.ibm.com
    NOTE:Emerging technologies.
    END:VCARD

Geolocation:

    geo:41.1816907,-96.1103624

Email:

    mailto:krhoyt@us.ibm.com

Wireless configuration:

    WIFI:S:Hoyt;T:WPA;P:ThisIsMyPassword;;

ZXing will not tell you the specific format of the data, or parse it for you. It is up to the developer to parse the data and make use of it in their application. A good way to get a handle on all the different formats is to generate QR codes using the [online](https://zxing.appspot.com/generator/) ZXing tool.

> Many mobile device operating systems have built QR code decoding into the camera functionality. If you put a QR code containing contact information in front of the iPhone camera, it will decode the data and prompt you to add a contact.

## Continuous Decoding

One thing you may have noticed about the decoding process is that once a result has been returned, the decoding process stops. This is ideal for your typical mobile application, but there are times when you will want to continue scanning repeatedly. If you are scanning a DVD inventory, you probably want to keep scanning. This will take a little work on our part.

> If you start the decode process again from within the result handler, the video stream will flicker as ZXing goes to attach the camera to the video.

Unfortunately, to address this need, we will have to sacrifice much of the simplicity of our previous implementation, and go back to our boilerplate of managing the video stream manually, and placing it onto a canvas element.

    navigator.mediaDevices.getUserMedia( {audio:  false, video:  true} )
    .then( ( stream ) => {
      this.video.srcObject = stream;
      this.video.play();
      
      this.detect();
    } )
    .catch( ( error ) => {
      console.log( error );
    } );

You may remember from our previous examples that use this approach, that the "detect()" method is where we do any computer vision processing that is needed. The same thing happens here, except that processing involves invoking ZXing to decode the contents. In this case, rather than call "decodeFromVideo()" we call "decodeFromImage()" which will get the encoded image from the canvas element.

    detect() {
      this.context.drawImage( this.video, 0, 0, this.canvas.width, this.canvas.height );
      this.reader.decodeFromImage( undefined, this.canvas.toDataURL() )
      .then( ( result ) => {
        this.output.innerHTML = result.text;
        console.log( result );
      } )
      .catch( ( err ) => {
        console.log( err );
      } );
          
      requestAnimationFrame( () => { return  this.detect(); } );
    }

## Pause Between Decoding

With the previous approach, you stand a good chance of decoding the same barcode repeatedly as the process will run several times per second. In our DVD inventory scanning use-case, this would result in capturing the same entry repeatedly. What we need is a pause between each scan. To handle this scenario we will leverage a state machine in our "detect()" and leverage "performance.now()" to track elapsed time.

    detect() {
      this.context.drawImage( this.video, 0, 0, this.canvas.width, this.canvas.height );
      
      if( this.state === Barcode.STATE_READING ) {
        this.reader.decodeFromImage( undefined, this.canvas.toDataURL() )
        .then( ( result ) => {
          this.state = Barcode.STATE_WAITING;
          this.last = performance.now();
          
          this.output.innerHTML = result.text;
          
          console.log( result );
        } )
        .catch( ( err ) => {
          console.log( err );
        } );
      } else if( this.state === Barcode.STATE_WAITING ) {
        if( ( performance.now() - this.last ) > Barcode.SCAN_DELAY ) {
          this.state = Barcode.STATE_READING;
        }
      }
      
      requestAnimationFrame( () => { return  this.detect(); } );
    }

You might be inclined to use "setTimeout()" or "setInterval()" for the delay, but "performance.now()" is custom designed for integration within "requestAnimationFrame()" painting. In this approach, the painting continues without setting up a separate process or handler. All we need is to track the timing.

## Toggle Reader Type

Once we have offloaded the video feed to a canvas element, and are managing the decode on an as-needed basis, we can more easily swap out the type of decoding that we are using. We will want to stop the decoding, then instantiate the alternative reader, then restart the decoding. One way to approach this is to set a flag when a button is pressed to toggle the barcode type.

    if( !this.toggle ) {
      requestAnimationFrame( () => { return  this.detect(); } );
    } else {
      switch( this.mode.getAttribute( 'data-mode' ) ) {
        case  Barcode.MODE_BARCODE:
          this.mode.classList.remove( 'barcode' );
          this.mode.classList.add( 'qrcode' );
          this.mode.setAttribute( 'data-mode', Barcode.MODE_QRCODE );
          
          this.reader = new  ZXing.BrowserQRCodeReader();
          break;
          
        case  Barcode.MODE_QRCODE:
          this.mode.classList.remove( 'qrcode' );
          this.mode.classList.add( 'barcode' );
          this.mode.setAttribute( 'data-mode', Barcode.MODE_BARCODE );
          
          this.reader = new  ZXing.BrowserBarcodeReader();
          break;
      }
      
      this.toggle = false;
      requestAnimationFrame( () => { return  this.detect(); } );
    }

> Since the decode call is the same for both 1D and 2D barcodes, none of that code needs to change.

## Mobile Scanner

Making a mobile barcode scanner is exactly the same process from the perspective of decoding. There is no additional code needed or different libraries to use. The complexities of a mobile scanner come mostly from managing the user interface. You will probably want a list of the scanned barcodes in one view, with the scanner being in a different view.

Throughout the workshop we have displayed the canvas. In the case of a mobile application, it is easier to display the video to the user, and keep the canvas element hidden. The reason for this is that it is easier to control the placement of the video and size the canvas to match. This will let you adapt between portrait and landscape mode more easily. This also makes it easier to put the signature "red line" over the video (even if the decoder does not really care). You can also more easily crop the area for the decoder to process.

## Rotation Invariant

ZXing works great on barcodes aligned with the access of the video element. If you tilt the barcode too far, the decoding process will not work. There is a library that handles this called "[Quagga.JS](https://serratus.github.io/quaggaJS/)" that attempts to find the barcode area, extract it, and rotate it to be horizontal, before hading it off to ZXing for decoding. Effectively wrapping up the object detection work we did from the previous section in the workshop. The "Issues" on the GitHub repository clearly indicate that there are some limitations still to be worked out. QuaggaJS can also abstract too much of the inner workings for some applications.

    Quagga.init( {
      numOfWorkers:  navigator.hardwareConcurrency,
      locate:  true,
      inputStream: {
        name:  'Live',
        type:  'LiveStream',
        target:  document.querySelector( 'div' ),
        constraints: {
          width:  640,
          height:  480,
          facingMode:  'environment'
        }
      },
      frequency:  10,
      decoder: {
        readers: [
          'code_128_reader'
        ]
      }
    }, ( err ) => {
      Quagga.start();
    } );
    
    Quagga.onDetected( ( result ) => {
      console.log( result );
    } );

## Just JavaScript

A newer entry to this space for QR codes is "[jsQR](https://github.com/cozmo/jsQR)". Rather than port an existing code base over to JavaScript bindings, jsQR is built from the ground up with JavaScript. This makes it ideal for inclusion in a Node.js workflow as well as the browser. In my testing, jsQR has performed as well as ZXing. It is however limited to QR code scanning.

    let code = jsQR( pixels.data, this.canvas.clientWidth, this.canvas.clientHeight );

