# Machine Learning

The world of artificial intelligence (AI), especially as it applies to the enterprise, is very much a wild west setting at the time of this writing. There have been many promising advances made over just the past few years, but they are a scattered minefield of different APIs, tooling, and documentation. Of course web standards are constantly moving forward as well, which exacerbates the complexities. Still, there are some amazing capabilities we can leverage in the browser today.

In this final section of the workshop, we will look at using commercial machine learning options via REST interface. Then we will turn to the latest, cutting edge AI/ML features available to the browser today - with some noted differences. Finally, we will abstract the complexities away to bring our computer vision quest full circle.

## Watson

When people hear Watson, even non-developers, they often know the name for taking on [Jeopardy in 2011](https://www.youtube.com/watch?v=WFR3lOm_xhE). At first glance, that kind of AI may seem distant; only available to companies with large contracts with IBM. In fact, many Watson features are available either directly via REST API, command-line tooling, or browser-based experiences. For example, the free tier of Watson Visual Recognition we will use today gives us 1,000 requests per month, with the standard plan being $0.002/request.

> The brand name "Watson" is a reference to Thomas J. Watson, who founded IBM in June of 1911.

Watson has many features. "Visual Recognition" centers around "classifying" the contents of a given image - effectively "What is in this picture?". "Natural Language Understanding" can tell you about a block of textual content - effectively "What does this talk about?". Watson even supports deep learning models created with [TensorFlow](https://www.tensorflow.org/), [Keras](https://keras.io/), and others, and will export for offline usage on iOS with [CoreML](https://developer.apple.com/documentation/coreml). If you have not looked at Watson for your AI needs before, this first exercise will give you a general introduction.

## :star: Visual Recognition

Probably the most common way that developers start interacting with machine learning is through classifying, or labeling images. Watson surfaces this feature as a REST API. Earlier in the workshop we leveraged drag-and-drop to examine content. In order to keep the focus on machine learning, I have abstracted drag-and-drop into a class called "DragDropCanvas". This enhancement to the "canvas" element handles drag-and-drop, file reading, resizing, and fitting to an existing canvas element. Events are raised at various points, with the pertinent data, for use in our application.

    <canvas width="640" height="480"></canvas>
    
    // ...
    
    this.canvas = new DragDropCanvas( document.querySelector( 'canvas' ) );
    this.canvas.addEventListener( 
      DragDropCanvas.EVENT_DROPPED, 
      ( evt ) => this.doFileDrop( evt ) 
    );

At this point, an image file can be dragged onto the surface of the "canvas" element, and the enhancements will start processing the contents. When the drop itself occurs, we will get an event that includes a reference to the file itself. The next step is to upload it to Watson.

### File Upload

For the purposes of uploading a file, an HTTP POST operation with a content type of "multipart/form-data" is the best fit - effectively an HTML form upload, with a file input, except that the file has come to us via drag-and-drop. The main construct used when sending a form is the "FormData" class.

    doFileDrop( file ) {
      this.output.innerHTML = '&nbsp;';
      
      let form = new FormData();
      form.append( 'file', file );
      
      fetch( Machine.RECOGNITION, {
        method: 'POST',
        body: form
      } )
      .then( ( result ) => { return result.json(); } )
      .then( ( json ) => {      

        // ...

      } );
    }

Once we have the "FormData" instance with the image file attached, we can make a "fetch()" call to perform the upload. In this case, to avoid having to have every student create their own Watson account, I have provided an IBM Cloud Function (serverless) proxy for the upload. Additionally, going directly from the browser to Watson would expose account credentials. A serverless proxy allows us to abstract those credentials, keeping them on the server, without having to stand up a server 24/7.

### Image Classes

The resulting JSON contains an "image" property. This is because it is possible to upload more than a single file for Watson to classify. 

Each image can have any number of "classifiers" run against the content. You can think of a "classifier" as the algorithm to be used in analysis. In this case, only the default Watson classifier is used, but we will leverage an additional classifier in a moment. 

Each class may find any given number of matches - or probably matches - to label the content. In the case of image classification, these generally include a name property, as well as a probability of a match. 

> Some image classification tools will return the results sorted by probability, others will effectively be random. 

### Build the Output

An aspect of AI not included with Watson is, Natural Language Generation (NLG). NLG will take various numerical input, and based off the model, will generate an output that reads (or sounds) as though it were written by a person. Since NLG is not readily accessible for such a small input sample, we will rough-in some basic grammar, and present the results to the user.

    doFileDrop( file ) {
      this.output.innerHTML = '&nbsp;';
      
      let form = new FormData();
      form.append( 'file', file );
      
      fetch( Machine.RECOGNITION, {
        method: 'POST',
        body: form
      } )
      .then( ( result ) => { return result.json(); } )
      .then( ( json ) => {      
        let primary = json.images[0].classifiers[0].classes[0].class;
        let modifier = 'a';
        
        if( primary.charAt( 0 ) === 'a' || primary.charAt( 0 ) === 'o' ) {
          modifier = 'an';
        }
        
        let phrase = `This looks like ${modifier} ${primary}.`;
        
        this.output.innerHTML = phrase;
      } );
    }

> In the above example, we use template literals, which are a relatively new feature to JavaScript that is well suited to this type of string concatenation. 

### Text-To-Speech (TTS)

We can additionally have Watson speak the results as well. The hooks to use TTS are already part of the example document. Once the output has been assembled, drop in the following line to hear Watson speak the results.

    WatsonSpeech.TextToSpeech.synthesize( {
      text: phrase,
      token: this.token
    } );

## Async/Await

Throughout this workshop, not only have we been able to explore computer vision, but also various JavaScript techniques/features you may not have had a chance to work with yet. When we are making REST calls for content classification, another JavaScript features that proves extremely useful is "async/await". The "async/await" feature allows us to turn callback handler spaghetti code into something that resemble single lines of synchronous code.

    classify( form ) {
      return  fetch( Machine.RECOGNITION, {
        method:  'POST',
        body:  form
      } )
      .then( ( result ) => { return  result.json(); } )
      .then( ( json ) => {
        return  json;
      } );
    }

In the above example, we have moved the "fetch()" call to classify content against Watson Visual Recognition into its own function. The "fetch()" returns a "Promise" that we return to the caller. The promise eventually resolves with the JSON data we get back from the call to Watson. Now we can call this function repeatedly, inline, as though it were any other synchronous line of code using the "await" keyword.

    let form = new FormData();    
    form.append( 'file', file );
    
    let watson = await this.classify( form );

In these three lines we build the form to submit, including the file, and send it to Watson to classify, placing the results in the "watson" variable. If we needed to call Watson repeatedly in a loop, we would use the same line, and the loop would treat the asynchronous code as synchronous. This is also extremely valuable for server requests that are first dependent on values from other server requests. We will see this in practice in the next section.

> While not particularly relevant to "async/await" it is worth noting that we do not pay any attention to the file that gets dropped into our example. We do not care about the size or dimensions in the slightest. This will be important once we move beyond Watson.

## Custom Classifier

Sometimes the content you want to classify is either (a) not part of the default model (b) specific to your business or (c) both. This is when you will want to make your own classifier. When it comes to Watson Visual Recognition, building a [custom classifier](https://www.ibm.com/watson/developercloud/visual-recognition/api/v3/curl.html?curl#create-classifier) consists of identifying key examples pertinent to your business, and uploading them to Watson (again via REST interface).

### Positive Examples

When building a custom classifier for Watson, the first group of images that you want to assemble is of those that match your use-case. If you are looking for a specific company logo perhaps, then you would have a collection of images containing that logo. You can start with as few as ten (10) images, but I suggest at least one-hundred (the limit is 10,000 images). The images also do not have to be particularly high resolution (the minimum resolution is 32x32 pixels).

You can have many groupings of positive examples. For example, if you wanted to build a custom classifier that looked for all of a specific city's professional sports teams by their logo. You might have a grouping of images for basketball, football, soccer, and so on. In this example, our positive grouping consists of Nebraska Cornhusker football helmets, at various angles, and in various settings.

### Negative Examples

Regardless of how many positive example groupings you have, you will have one negative grouping per custom classifier. In the case of professional sports teams, you might put all the logos from the minor league teams, or other pro-level teams not in your city, in this grouping. In the case of the Nebraska Cornhuskers, the negative examples consists of randomly selected football helmets from other teams indifferent to the rank.

### Upload to Watson

Each of the positive examples should be archived into their own file. The name of the file is particularly important. The name used for the archive will become one of the class names that can be returned from the custom classifier. In the case of the Nebraska Cornhuskers, getting the name "nebraska" back as a class will be sufficient, so I labeled my positive examples "nebraska_positive_examples.zip". 

The negative examples should also be archived into a single file. The name of the archive of negative examples, regardless of how many positive examples there are, should be "negative_examples.zip". From there all positive files, and the negative files, along with a name for your classifier, can be sent to Watson as an HTTP POST (multipart form again).  Here is an example using cURL, though your method or tooling may be different.

    curl -X "POST" "https://gateway.watsonplatform.net/visual-recognition/api/v3/classifiers?version=2018-03-19" \
      -H 'Content-Type: multipart/form-data; charset=utf-8;' \
      -u 'apikey:_YOUR_API_TOKEN_' \
      -F "name=hdc" \
      -F "nebraska_positive_examples=" \
      -F "negative_examples="

The result content will be JSON-formtted data. Of specific interest is that the content will take some time to train (the "status" field). How long depends on a number of factors from the example count, to the tier of service. The "classifier_id" property will be used to ask Watson to use your specific custom classifier. You can also see the possible class names that can be returned.

    {
      "classifier_id": "hdc_1406979128",
      "name": "hdc",
      "status": "training",
      "owner": "eb22ec50-1f7b-406e-86b9-ab5bdaafa82b",
      "created": "2018-08-31T18:50:40.223Z",
      "updated": "2018-08-31T18:50:40.223Z",
      "classes": [{
        "class": "nebraska"
      }],
      "core_ml_enabled": true
    }

When you build a custom classifier, Watson also creates an iOS CoreML model. Through the use of the Watson SDK for iOS, you can actually download the model local to the device and use it for offline classification.

> There is also a REST API to check the training [status](https://www.ibm.com/watson/developercloud/visual-recognition/api/v3/curl.html?curl#get-classifier). You do not want to run classification of content while the Watson it building your custom classifier.

### Invoke the Classifier

Sending content to be used against the custom classifier is almost identical, except that you can specify the name of your specific model as a form value (input element). When Watson receives the custom classifier name, it will ignore the built-in model. The classifier ID parameter is a comma-delimited string, so you can also pass "default" if you want Watson to also use its built-in classifier.

    let form = new FormData();
    form.append( 'file', file );
    form.append( 'classifiers', 'hdc_1406979128' );

    let watson = await this.classify( form );

## Async/Await Redux

There are a lot of different ways to decide how you want to handle the classifier results. For this example, we are going to lean on the previously covered "async/await" functionality. First we will ask Watson to use our custom classifier, and only our custom classifier. If that does not come back with a reasonably high probability for a match, then we will run the classifier again, against only the default model.

    let  form = new  FormData();
    form.append( 'file', file );
    form.append( 'classifiers', 'hdc_1406979128' );
    
    let watson = await this.classify( form );
    
    if( watson.images[0].classifiers[0].classes[0].score < 0.90 ) {
      form.delete( 'classifiers' );
      watson = await this.classify( form );
    }

Imagine this work using callback handlers, or even promises. You would have to keep track of the file across a scope applicable to all the handlers, then string together the events based on a conditional evaluation. With "async/await" this looks like any other dozen lines.

## TensorFlow.JS

With a general understanding of how to classify visual content with Watson under our belts, let us turn to [TensorFlow](https://www.tensorflow.org/) to get a feel for what an alternative approach might look like - specifically [TensorFlow.JS](https://js.tensorflow.org/). Originating from Google AI, TensorFlow has a healthy open source lineage.

### Load the Models

Before we classify any images, we need to tell TensorFlow.JS to load the desired model. When using Watson, the model was vast, and on IBM Cloud. It would not be feasible to load the same model on the client - which would probably bring the average machine to a standstill. As an alternative, we need to find and load a smaller model. One that gives us some number of classes (labels) that is viable for the browser.

    this.mobilenet = null;
    
    tf.loadModel( Machine.MOBILE_NET )
    .then( ( result ) => {
      this.mobilenet = result;
      this.mobilenet.predict( tf.zeros( [1, Machine.DIMENSIONS, Machine.DIMENSIONS, 3] ) ).dispose();
    } );

One such option for classification is MobileNet, which weighs in at around 40 Mb. TensorFlow uses a model manifest file to be able to chunk the download so as to load it faster. It uses a pared down version of the ImageNet set of classifications. When we complete a classification, MobileNet will return numeric values. We will need to map those to the ImageNet classes.

    this.imagenet = null;
    
    fetch( Machine.IMAGE_NET )
    .then( ( result ) => { return  result.json(); } )
    .then( ( json ) => {
      this.imagenet = json;
    } );

### Prepare and Predict

Unlike Watson, which will classify just about any image you throw at it, MobileNet requires that images be sized to 224x224 pixels square. This means loading the file and then placing it on a canvas element to cover the surface, then placing those bytes into an image element. Luckily, the enhanced canvas class we have been using takes care of this for us, and raises an event when the image is resized.

    this.canvas = new DragDropCanvas( document.querySelector( 'canvas' ) );
    this.canvas.addEventListener( 
      DragDropCanvas.EVENT_RESIZED, 
      ( evt ) => this.doFileResized( evt ) 
    );
    
    // ...
    
    async doFileResized( resized ) {
      let  logits = tf.tidy(() => {
        let  image = tf.fromPixels( resized ).toFloat();
        let  offset = tf.scalar( Machine.DIMENSIONS / 2 );
        let  normalized = image.sub( offset ).div( offset );
        let  batched = normalized.reshape( [1, Machine.DIMENSIONS, Machine.DIMENSIONS, 3] );
        
        return  this.mobilenet.predict( batched );
      } );
      
      // ...
      
    }

The main data structure in TensorFlow is a "Tensor". A "Tensor" is a matrix - a multidimensional array. You can think of our (resized) image as an array that is 224x224x3. The three (3) is there for the red, green, and blue pixels of the image. The other thing to consider is that we have one (1) image to classify. Once we are all done the image will be placed in a "Tensor" that is 1x224x224x3. We can then use that to run the classifier.

> Where do we get the 224x224 requirement? Loads and load of digging. As previously mentioned, AI/ML is still very much the wild west of computing. Various pieces surface from academic work done over the past decade, while other bits are more modern innovations from yet other academics. Putting it all together takes a significant amount of digging.

### Match to Classes

The resulting value of the classification is an object containing various numeric values. These values generally map to the ImageNet classes, but require further processing. We will also want to sort the resulting classes by their probabilities.

    let classes = await this.predict( logits, 10 );
    
    // ...
    
    async predict( logits, top ) {
      let values = await logits.data();
      let  valuesAndIndices = [];
      
      for( let  i = 0; i < values.length; i++ ) {
        valuesAndIndices.push( {value: values[i], index: i} );
      }
      
      valuesAndIndices.sort( ( a, b ) => {
        return b.value - a.value;
      } );
      
      let topkValues = new Float32Array( top );
      let topkIndices = new Int32Array( top );
      
      for( let  i = 0; i < top; i++ ) {
        topkValues[i] = valuesAndIndices[i].value;
        topkIndices[i] = valuesAndIndices[i].index;
      }
      
      let topClassesAndProbs = [];
      
      for( let  i = 0; i < topkIndices.length; i++ ) {
        topClassesAndProbs.push( {
          className: this.imagenet[topkIndices[i]],
          probability: topkValues[i]
        } );
      }
      
      return  topClassesAndProbs;
    }

From here we are back to assembling the resulting phrase, displaying it, and optionally having Watson speak the results to the user. If the above code seems like black magic, I totally agree. What would be nice is an abstraction on TensorFlow that makes it usable without having to know all the gory details.

## :star: ML5.JS

Such an abstraction exists in the form of [ML5.JS](https://ml5js.org/). With ML5.JS we start off by specifying what type of classifier we want to use. ML5.JS has multiple models for various purposes. We will come back to this in a moment. 

    this.classifier = ml5.imageClassifier( 'MobileNet', () => {
      this.indicator.classList.add( 'ready' );
    } );

### Classify the Resized Image

An external model still needs to be loaded, and we get a callback when it has completed. We can use this event to let the user know that everything is ready to go. For classification, we can leverage the resizing event from the enhanced canvas we have been using for this section of the workshop. Oddly enough, the MobileNet model that ML5.JS uses requires that the image be 400x400 pixels. Why the difference? Magic that goes back to the specific MobileNet model that ML5.JS is using.
    
    doResized( image ) {
      this.classifier.predict( image, ( err, results ) => {
      
        // ...
        
      } );
    }

### Assemble the Output

At this point, we have all the classes and their probabilities as run against the MobileNet model. All that is left is to assemble the output and display the results.

    doResized( image ) {
      this.classifier.predict( image, ( err, results ) => {
        let  primary = results[0].className.toLowerCase();
        let  modifier = 'a';
        
        if( primary.indexOf( ',' ) ) {
          primary = primary.split( ',' )[0].trim();
        }
        
        if( primary.charAt( 0 ) === 'a' ||
            primary.charAt( 0 ) === 'o' ||
            primary.charAt( 0 ) === 'e' ) {
          modifier = 'an';
        }
        
        let  phrase = `This looks like ${modifier}  ${primary}.`;
        
        this.output.innerHTML = phrase;
        
        WatsonSpeech.TextToSpeech.synthesize( {
          text:  phrase,
          token:  this.token
        } );
        
        console.log( results );
      } );
    }

Some of the classes from ImageNet have comma-delimited values. To keep our output concise, we split out the values and use on the first value. Run some of the examples through the ML5.JS exercise and see what the resulting values are labeled. I think you will find that using a smaller model, one that we can use on the client side, comes with some pretty significant limitations in terms of accuracy.

## :star: YOLO

Last, but not least it is time to bring our computer vision examples full circle. Another model supported by ML5.JS is [YOLO](https://pjreddie.com/darknet/yolo/). Unlike the image classification that we were previously using across Watson and TensorFlow, You Only Look Once (YOLO) is a feature extractor. That is to say that you present an image and it is analyzed to find the various objects inside the image, as opposed to looking at the image on the whole. YOLO feature extraction is the type of model that might be used for self-driving vehicles to avoid various obstacles in the road. It is less interested in accuracy of the content, but rather the parts that make up the image.

### Instantiate the Classifier

The model for YOLO Tiny that is used by ML5.JS weighs in at about 18 Mb and must be loaded before we can use it. As with the previous example, once the model is loaded, we get a callback and update the user interface accordingly to let the user know they can proceed.

    this.classifier = ml5.YOLO( () => {
      this.indicator.classList.add( 'ready' );
    } );

### Detect the Features

Feature extraction with YOLO and ML5.JS is very similar to image classification. The main difference is that we do not call a "predict()" method, but rather a "detect()" method.

    doResized( image ) {
      this.classifier.detect( image, ( err, results ) => {
        console.log( results );
      } );
    }

### Highlight the Features

The resulting data structure is an array containing possible features. Each element in the array is an object that contains the class name, the probability of accuracy, and the relative coordinates for the bounding box of that object. Again, in this case, we are less concerned with the content of the overall image, so we will not display any particular output in the form of a text string. Rather we will draw the results on the canvas.

    doResized( image ) {
      this.classifier.detect( image, ( err, results ) => {
        for( let c = 0; c < results.length; c++ ) {
          let x = results[c].x * this.canvas.display.canvas.clientWidth;
          let y = results[c].y * this.canvas.display.canvas.clientHeight;
          let width = results[c].w * this.canvas.display.canvas.clientWidth;
          let height = results[c].h * this.canvas.display.canvas.clientHeight;
          
          this.canvas.display.context.beginPath();
          this.canvas.display.context.strokeStyle = 'red';
          this.canvas.display.context.lineWidth = 3;
          this.canvas.display.context.strokeRect( x, y, width, height );
        }
        
        console.log( results );
      } );
    }

> Feature extraction is something that Watson does not currently perform via a REST API.

The resulting bounding boxes will look very similar in nature to the geometry-based bounding boxes we were using in our earlier object detection. As with most things programming, there are various means to the end, and it is important to choose the right one for the task at hand. Trying dropping various images onto the canvas element, and you will quickly see how the YOLO model has biases for traffic, but does very poorly at much else. Bias is an important area of research currently ongoing in the world of AI.

