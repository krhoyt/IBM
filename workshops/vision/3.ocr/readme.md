# Optical Character Recognition

Optical Character Recognition, or OCR, has been around in various forms since the 1920s. IBM has a patent for OCR dating back to 1931. There is no doubt however that the availability of smartphones - the computer in your pocket - really broadened awareness for the technology. OCR has broad applications ranging from scanning passports at airport security, to the business card of a prospective customer you just met. Emerging cases include extracting text from photos on social media, and even understanding road signs for the self-driving car.

## Drag and Drop Primer

Before we get into OCR proper, let us take a side road down drag-and-drop functionality in the browser. Not to be confused with drag-and-drop inside the viewport, in this instance we specifically want to look at dragging a file from outside of the browser, into the browser viewport, and then reading it so we can place it in an image file. From there we will be able to run our OCR process and recognize the text inside the image.

### Document Elements

The first document element we will need is a drop zone - an element on which we specifically listen for the drag-and-drop events. While that can be any element, we will want to draw the contents of the file into a canvas element, so let us use a canvas element as the drop zone.

    <canvas width="640" height="480"></canvas>
    <img>

When the file (an image) is dropped onto the canvas, we will not initially have access to the contents. For this we will need to read the file bytes, then place them into an image element as the source. Once we have the image loaded, we can further process it with OCR.

### Element References

As the canvas element will be the drop zone for our drag-and-drop operation, we will want a reference to it. This will also allow us to get a context reference which will be part of our OCR exercise proper. While there are a number of drag-and-drop events, for the purposes of this exercise we are interested in when the file is dragged over the canvas, and when it is dropped onto the canvas.

    this.canvas = document.querySelector( 'canvas' );
    this.context = this.canvas.getContext( '2d' );
    this.canvas.addEventListener( 'dragover', ( evt ) =>  this.doDragOver( evt ) );
    this.canvas.addEventListener( 'drop', ( evt ) =>  this.doDragDrop( evt ) );

When the file is dropped on the canvas, we will read in the contents and place them into an image element. To this end, we will want a reference to that image element. We will also want to know when the image file has been loaded. While reading and placing a file into the image element is almost instantaneous for most files, the actual rendering to the browser DOM may take a few milliseconds more. We do not know the size of the dropped image until the image is loaded, which is why we are interested specifically in that event.

    this.sample = document.querySelector( 'img' );
    this.sample.addEventListener( 'load', ( evt ) =>  this.doImageLoad( evt ) );

### Event Handlers

Normally, if you drag a file from outside of the browser, into the viewport, and drop it, the browser will attempt to display the raw content. We do not want this to happen, so we must prevent those events from bubbling. Browser-generated events generally have a "preventDefault()" method on them that allows us to stop the browser from handling the event in the normal (raw) manner.

    doDragOver( evt ) {
      evt.preventDefault();
    }

    doDragDrop( evt ) {
      evt.preventDefault();
    }

### Reading the File

Now we are ready to read the bytes of the dropped file. Back in our constructor let us create an instance of "FileReader" and add an event listener for when the file has been loaded, or read in its entirety.

    this.io = new  FileReader();
    this.io.addEventListener( 'load', ( evt ) =>  this.doFileLoad( evt ) );

There are many ways that "FileReader" allows us to process the contents of a file. It is not limited to bytes, but that is what we are interested in for the purposes of an image. In the "doDragDop()" handler is where we will get a reference to the file to be read, which makes it the best place to start that operation. 

On a drop event there is a property called "dataTransfer" which represents the content being dropped. You can put other content onto the "dataTransfer" object, but in this case, that is where we will find the list of files being dropped already populated for us as a property called "files". The "files" property is an array of "File" objects, as the user may have dropped more than one file. In our case, we are going to cut corners and assume only one file, and then start reading that file.

    this.io.readAsDataURL( evt.dataTransfer.files[0] );

When the file is finished being read, our "load" handler on the "FileReader" instance will be called. You can access the contents of the file on the event object, but I prefer to keep the "FileReader" instance at a scope where I can reference it directly. From here we can put the file contents into the image element.

    doFileLoad( evt ) {
      this.sample.src = this.io.result;
    }

### Drawing the Contents

Once all the bytes of the file have been loaded into the image element, and the DOM has been updated with the constraints specific to the image (width, height), the image elements "load" handler will be called. While we will not display the image element itself this event lets us know that we can render the contents to the canvas element using the context.

    doImageLoad( evt ) {
      this.draw();
    }

The image file might be of any sizing, but our canvas element is only 640 x 480. We want to draw the image element content into our canvas element, but we do not want the contents to be distorted - this would make OCR far less accurate. To that end, we will want to determine the aspect ratio of the dropped image to scale it down appropriately if needed.

    draw() {
      let  aspect = this.canvas.clientWidth / this.sample.clientWidth;
      let  height = Math.round( this.sample.clientHeight * aspect );
      let  offset = Math.round( ( this.canvas.clientHeight - height ) / 2 );

      this.context.clearRect( 0, 0, this.canvas.clientWidth, this.canvas.clientHeight );
      this.context.drawImage( this.sample, 0, offset, this.canvas.clientWidth, height );
    }

To remove any previous dropped content we call "clearRect()" on the context object, and then "drawImage()" to place the image within the canvas. Now we are ready to process the dropped image for textual content.

> Note that we will still run OCR on the original image, not the canvas. We want as much content to work with as possible to get the best results.

## :star: Tesseract.JS

As with most things JavaScript, there are a few libraries that can do OCR in the browser. One library you are likely to encounter is [OCRAD](https://github.com/antimatter15/ocrad.js) by MIT's [Kevin Kwok](https://antimatter15.com/). OCRAD is fast, and basic. You give it an image, it gives you a string of the text it found. 

Another project by Kwok is [Tesseract.JS](http://tesseract.projectnaptha.com/) which is a port of a well-known OCR engine that leverages machine learning techniques. This means the engine is modular and expandable, supporting multiple languages, and gives you additional information such as bounding boxes and baselines for discovered content. We will be using Tesseract.JS for this project.

## :star: Recognizing Text

With our drag-and-drop background set, we are ready to process an image for textual content. Tesseract.JS makes this extremely straightforward. We will jump in at our "doImageLoad()" handler, and instead of immediately drawing the image onto the canvas element, we will process it for text by calling "Tesseract.recognize()". This method expects a reference to the image element being analyzed, and an object containing any specifics for processing such as the language.

    Tesseract.recognize( this.sample, {lang:  'eng'} )
    .then( ( result ) => {
      this.draw( result.words );
    } );

Notice that the implementation is promise-based. When run for the first time, a whole series of activities will launch in the background. Then the processing will take place. Finally, our application will be handed results. Many applications may only want the results, but we want to dig in a little further by drawing onto the canvas element what Tesseract.JS actually found.

## :star: Drawing the Results

The results object is an array of words that Tesseract.JS thinks it found. Depending on the noise in the source image, there could be a lot of extra words, letters, and other characters in which we are not interested. Due to the machine learning underpinnings, each word comes complete with a confidence level. To make our job of rendering more accurate, we can first eliminate any words below a certain confidence.

    for( let  w = 0; w < words.length; w++ ) {
      if( words[w].confidence < Reader.CONFIDENCE ) {
        continue;
      }

      // ...
    }

> Confidence levels range from zero (0) meaning effectively no confidence, to one (1.0) meaning absolute confidence. You may want to tweak this word elimination based on your specific needs. For the purposes of this example, the "Reader.CONFIDENCE" property is set at 0.70.

Remember that we processed the original size image with Tesseract.JS but may have scaled it to fit our canvas element viewport. This is where those aspect ratio calculations come back into play. Each word object in the array will contain information about where in the *original* image the text was located. We will need to scale that accordingly. Two interesting properties we will draw include the baseline of the text, and the bounding box of the text.

    // Bounding box
    this.context.strokeStyle = '#2767f6';
    this.context.strokeRect(
      words[w].bbox.x0 * aspect,
      ( words[w].bbox.y0 * aspect ) + offset,
      ( words[w].bbox.x1 - words[w].bbox.x0 ) * aspect,
      ( ( words[w].bbox.y1 - words[w].bbox.y0 ) * aspect )
    );

    // Baseline
    this.context.strokeStyle = 'red';
    this.context.beginPath();
    this.context.moveTo(
      words[w].baseline.x0 * aspect,
      ( words[w].baseline.y0 * aspect ) + offset
    );
    this.context.lineTo(
      words[w].baseline.x1 * aspect,
      ( words[w].baseline.y1 * aspect ) + offset
    );
    this.context.stroke();

Images that are direct, black and white, scans of the source material work best with Tesseract.JS. When color is introduced, or content beyond the bounds of the text itself, Tesseract.JS is markedly less accurate. It is also important to note that subsequent recognition passes are markedly more performant. Not quite performant enough to process in real-time, which is a topic will come back to in a moment.

> The words that are parsed from the image can often be nonsense. This is because Tesseract.JS is not interested in the semantics of the language, and has no knowledge of the language beyond the common glyphs that are used. It is up to you to further process the words to match them to actual words and to make semantic sense (something Watson Natural Language Understanding is especially good at). If you are interested in further refining the words you might look at comparing them against a dictionary such as (Google's Trillion Word Corpus)[https://github.com/first20hours/google-10000-english].

## Watson Speech

How about speaking the results? While [speech synthesis](https://caniuse.com/#search=speech) is something that has made its way to the browser, the output often sounds like a robot from the 90s. There is no inflection or awareness of the content being spoken. By comparison, Watson Text-to-Speech (TTS), can make quick work of this from the browser. Here is how we can get the browser to speak the results of our OCR work.

### Token Authorization

The Watson TTS API first requires getting an authorization token from the service. This token has a limited lifespan, so if you know that your application is going to be using the service over an extended duration, you can get a token for each time you want Watson to say something. For our purposes we will get the token when the application launches, and then use it throughout.

    fetch( Reader.WATSON_TOKEN )
    .then( ( result ) => { return  result.json(); } )
    .then( ( data ) => {
      this.token = data.body;
    } );

### Assembling the Text

While Tesseract.JS will give us words in the content, it is up to us assemble the text to be spoken by Watson. Let us jump over to the "draw()" method where we are working with the result words. We will want a variable to hold the assembled text, which we will call "phrase". As we iterate through the words to draw the outlines on the canvas, we can also string them together on our "phrase" variable.

    draw( words = [] ) { 
      let phrase = '';

      // ...

      for( let  w = 0; w < words.length; w++ ) {
        // ...

        phrase = phrase + ' ' + words[w].text;
      }
    }

The last step then is to tell Watson to synthesize the speech based on the assembled phrase. The Watson Speech library comes to the assist here with a call to "WatsonSpeech.TextToSpeech.synthesize()". The call takes an object with a "text" property representing the content to be synthesized (spoken), as well as a "token" property referencing our authorization to use the service. 

    WatsonSpeech.TextToSpeech.synthesize( {
      text:  phrase,
      token:  this.token
    } );

> At one point Watson services included an OCR functionality of its own, and it was very capable. Unfortunately, this service was deprecated.

## Reading from Video

Building on our previous pattern of capturing image content from a video source, we can now lean into capturing content from a video feed. As mentioned earlier, Tesseract.JS is not fast enough to handle this in real-time, so we will need to ask the user to tell us when they are ready for us to read the content. At that point we will freeze the video, put the canvas content into the image element, and run Tesseract.JS OCR. 

> Reading text from video involves a state machine and some toggling of the video and canvas element adding about another one-hundred lines of code. Still not unmanageable, but more than we will cover in this workshop. What follows are the key points for consideration.

### Listening to the User

In order to have the user tell us that they are ready for the OCR processing, we will listen for a key press on the document on the whole. I generally like the space bar to trigger this content as a click often means being able to see the screen. If the user is holding up the text that they want recognized, then it is likely that they cannot see the screen and/or the mouse. This can result in the user clicking on elements in the user interface with unintended consequences.

    document.body.addEventListener( 'keypress', ( evt ) =>  this.doKeyPress( evt ) );
    
    doKeyPress( evt ) {
      if( evt.keyCode === 32 ) {
        this.capture();
      }
    }

### Capturing the Content

If you recall from our video pattern in previous exercises, there is a "draw()" method that is being continuously called to paint the contents of a hidden video stream, onto the visible canvas element. When the user presses the space bar, we want to stop that updating process. While you might be inclined to pause the video, it is easier to simply stop painting the video onto the canvas. A state machine makes quick work of this need.

    capture() {
      if( this.state === Reader.STATE_PAINTING ) {
        this.state = Reader.STATE_READING;
        this.sample.src = this.canvas.toDataURL();
      } else if( this.state === Reader.STATE_READING ) {
        this.state = Reader.STATE_PAINTING;
        this.detect();
      }
    }

There are two distinct states in play for this application. The first is "Reader.STATE_PAINTING" which indicates that the video content is being painted onto the canvas element over in the "draw()" method. The second is "Reader.STATE_READING" which indicates that we have paused the video and are running OCR. When the user presses the space bar, and the video is being painted, we will switch states, pausing the video, and put the current canvas contents into the hidden image element for processing.

When the canvas content is placed into the image element, a "load" event will be fired and the OCR processing happens as we have previously covered. When the space bar is pressed a second time, we resume painting the video content onto the canvas element, which will erase any drawing we may have had previously displayed. The trick here is the "toDataURL()" method on the canvas element (not the context object), which grabs the canvas content encoded as an image.

## Next Steps

One thing you will notice is that if there is ANY other content in the video frame beyond the black and white text itself, that you will get some additional "noise" characters out of the OCR process. What we really need to do is isolate just the black and white content. We can get closer to this objective by using computer vision object detection techniques. This brings us to the next section of our workshop.
