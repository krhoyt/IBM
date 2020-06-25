###Orientation

The workshop includes a complete [Express](http://expressjs.com/) implementation that maps the calls the web application makes, to [Watson](https://www.ibm.com/watson/developercloud/)-specific APIs. This is included for your reference. You do not need [Node.js](https://nodejs.org/en/) installed to follow along with the code examples. You will need a **web server** of some fashion. 

> You can start a web server in any directory on a Mac using the built-in PHP or Python services ...
> 
> php -S localhost:8000
> python -m SimpleHTTPServer 8000

In keeping with Express convention, the "**public**" directory is where the client-side assets are located. Start your web server in this directory, or move the contents of the "public" directory to your preferred web server. 

Inside the "public" directory is a "**script**" directory, and inside there is a folder for each of the various examples to be covered during the workshop. The examples are all stepped out to make it easier for everybody to keep up regardless of their ability. Files with a "**0.js**" are the starting points, with the highest number in each directory being the completed version for that feature.

The other two main files that need to be edited during the workshop are "**index.html**" and "**script/workshop.js**". These are mostly completed already, and load styles, fonts, external JavaScript libraries, etc. They will be edited repeatedly throughout the workshop to add more features to the example application.

> Heavy use of the reveal pattern is made throughout the workshop. This pattern allows encapsulation of the functionality for each feature covered during the workshop. 

###Speech To Text (STT)

Speech-To-Text (STT) is probably one of the more enjoyable places to start with machine learning. Capturing audio, processing the files, analyzing them for vocal patterns, and then mapping them to text, represents enormous new capabilities at your developer fingertips.

STT in Watson is accomplished using [Web Sockets](http://caniuse.com/#feat=websockets). This is true if you are using the Web, but also if you are deploying to iOS or Android. Audio capture on the Web is accomplished through the use of the [Web Audio API](http://caniuse.com/#feat=audio-api). To abstract the details of using both Web Sockets and Web Audio, the Watson team has produced a wrapper [library](https://github.com/watson-developer-cloud/speech-javascript-sdk) that exposes the specific STT features.

    <script src="script/watson-speech.js"></script>

This library has been downloaded, made available locally, and has already been added to the "index.html" file.

**Request Access Token**

In order to use the STT library, the first step is generating an access token. This token is valid for one hour, so if you have an application that will go a long time without being refreshed ([SPA](https://en.wikipedia.org/wiki/Single-page_application)), then the token will need to be refreshed periodically. 

> In this example application, a new token will be created for each time the Watson STT service is invoked. 

To get a token, a request is made from the client to an Express server instance running on [IBM Bluemix](https://bluemix.net/). That server uses [pre-configured] account credentials to call Watson and retrieve the token. The results are then sent back to the client, where the token can be applied in calling the Watson STT service.

    // Access token
    router.get( '/token', function( req, res ) {
	  var hash = null;
	  var token_url = null;
	  var watson_url = null;

      // Authentication
      // HTTP Basic
      hash = new Buffer( 
        req.config.stt.username + 
        ':' + 
        req.config.stt.password
      ).toString( 'base64' );
  
      // Build the URL
      watson_url =
        'https://stream.watsonplatform.net/authorization/api/v1/token' + 
        '?url=' + 
        req.config.stt.url;

      // Request token
      request( {
        method: 'GET',
        url: watson_url,	
        headers: {
          'Authorization': 'Basic ' + hash
        }
      }, function( err, result, body ) {
        res.send( body );
      } );
    } );

The username, password and URL, for interacting with Watson STT are provided when you register the service as part of your IBM Bluemix account. The token URL is a combination of the URL for authentication, given from the [documentation](https://www.ibm.com/watson/developercloud/doc/getting_started/gs-tokens.shtml), and the URL of the service being accessed. The result from the call is a 1 kb Base64 encoding of an encrypted payload. Put another way - just a big string.

**Send Content to Watson**

As mentioned, audio content can be captured through the Web Audio API, but you can also upload pre-recorded audio for Watson to process. This example will take both options into consideration. Open "**script/stt/stt.0.js**" and add the following code after the comments found on **line 78**.

    // Start stream to Watson
    // Either microphone or local file
    if( source == null ) {
       watson = WatsonSpeech.SpeechToText.recognizeMicrophone( {
         continuous: false,
         objectMode: true,
         token: xhr.responseText
      } );
    } else {
      watson = WatsonSpeech.SpeechToText.recognizeFile( {
        data: source,
        token: xhr.responseText
      } );
    }

The "source" variable will be set if an audio file is dropped into the example application. If that is the case, the "else" block of the above code will be executed. The "**data**" property represents the audio file, and the previously retrieved token is also presented.

If the "source" variable is not set, then the example application expects that you will want to capture audio from the device microphone. With "**continous**" set to "**false**", Watson will look for a natural pause in the incoming video, and release the microphone once transcription is complete. The "**objectMode**" property tells Watson that we want the updates to the transcription to be reported to us as JSON objects. Finally, the token will also need to be provided.

The example application can now capture audio.

**Transcription Events**
*(script/stt/stt.1.js)*

There are a few events that can be captured during the transcription process. The first event is called "**data"** and allows the application to see the transcription as it progresses. In order to handle errors, there is an "**error**" event. When the transcription process is complete, the "**end**" event will get called. To wire up these events, add the following code after the comments around **line 96**.

    // Transcription events
    watson.setEncoding( 'utf8' );
    watson.on( 'data', doWatsonData );
    watson.on( 'error', doWatsonError );
    watson.on( 'end', doWatsonEnd );                

**Transcript Changes**
*(script/stt/stt.2.js)*

If audio is being captured from the microphone, the transcript will change as more audio is captured, and as Watson makes more sense of the content.  If an audio file was uploaded, then the final transcript will presented. Both of these values will be available in the "**data**" event. Add the following code to manage the transcript changes after the comments around **line 115**.

    // Track changes to transcript
    if( source == null ) {
      // Copy full object
      transcript = Object.assign( {}, data );

      // Display current
      emit( STT.PROGRESS, {
        transcript: transcript.alternatives[transcript.index].transcript    
      } );
    } else {
      // Just a string
      transcript = data;
    }

Note also that in the case of a live audio feed, the event arrives as a JavaScript object. This object tells the application what has been transcribed thus far, as well as if Watson believes the capture session to be complete. Alternative transcripts can also be presented.

**Final Transcript**
(script/stt/stt.3.js)

When Watson believes the capture session is complete, the "**end**" event will be raised. In the case of a recorded audio file, the transcript will have already been presented. In the case of a live audio recording, the application will want to capture the final transcript value. Add the following code to the comments around **line 139**.

    // Isolate result by source
    // Just want raw text at this point
    if( source == null ) {
      transcript = transcript.alternatives[transcript.index].transcript;
    }        

In this example application the "data" and "end" events are emitted as events from the module, to the application logic, where it is displayed accordingly.

**Checkpoint**

If you have followed along, then the example application will now allow you to capture audio (recorded or live) and present the transcript. If you encounter problems, or are simply following along, go to "**index.html**" and change "**stt.0.js**" to "**stt.4.js**".

The **developer console** in the browser displays the "data" events as they are captured. It is useful to look at these objects to see what Watson is reporting, and to understand how the transcript can change over time depending on the phrase that Watson is processing.

![Transcript](http://images.kevinhoyt.com/watson.workshop.stt.png)

###Text To Speech (TTS)

Being able to speak to Watson, and get a response with text content is an enjoyable exercise on its own. It would be even more enjoyable if Watson spoke back to us. Remembering that Watson is a computer however, begs the question "What should Watson sound like?" This is especially important when we consider regional dialects.

> The authentication process of retrieving a token is the same with TTS as it is with STT. This material will not be presented again for the remainder of the workshop, except where differences occur.

**I Hear Voices**

Add the workshop module "**script/tts/tts.0.js**" to the "**index.html**" file. You can do this either by moving it from the comment block found at the bottom of the "index.html" file, or by adding the script tag manually.

    <script src="script/tts/tts.0.js"></script>    

There are thirteen different voices available when this content is being written. The default voice for Watson is labeled "Michael" which is the voice you hear Watson use on [Jeopardy](https://www.youtube.com/watch?v=WFR3lOm_xhE), and IBM Watson television [commercials](https://www.youtube.com/watch?v=f8T8eWBmls0).

The workshop module "**script/tts/tts.0.js**" automatically retrieves the voice list, as the example application is being loaded. The results are displayed in the **developer console**.

![Voices](http://images.kevinhoyt.com/watson.workshop.voice.png)

**Synthesizing Speech**

The TTS functionality of Watson is exposed to JavaScript in the browser using the same wrapper library that is used for STT. The process of creating speech from a body of text is called "synthesis." To synthesize a body of text, open "**script/tts/tts.0.js**" and add the following code after the comments on **line 32**.

	// Speak the intent
    WatsonSpeech.TextToSpeech.synthesize( {
      text: content,
      token: xhr.responseText,
      voice: current            
    } );

**Checkpoint**

If you have followed along, then the example application will now echo what Watson thinks you said, or what was provided in the recorded audio. If you encounter problems, or are simply following along, go to "**index.html**" and change "**tts.0.js**" to "**tts.1.js**".

###Conversation

Having Watson convert the spoken word to text, and then repeat it back to us using synthesis in the "Michael" voice is neat, and interesting, but hardly useful. In order to have a dialog with Watson, it is necessary to train the system on the types of phrases that may be encountered, and the types of statements that might be expected in response. The tooling used to perform this training is contained in the [Watson Conversation Service](https://www.ibm.com/watson/developercloud/conversation.html) found in IBM Bluemix.

**Intents**

![Conversation Intents](http://images.kevinhoyt.com/watson.workshop.intents.png)

Intents represent an action, as in "What is the intent of this text content?" It maps meaning onto our otherwise nondescript text. In the screenshot above, there are three intents - welcome, turn on, and turn off. In the "**welcome**" intent there is a collection of phrases that might map to the incoming text. As with most things in machine learning, the more samples the better.

Note the general vagueness of the provided phrases. This is intentional. The objective is to give Watson enough of a semantic pattern to decide to explore one intent over another. With that decision made, we can use **entities** to help make ensure an accurate response.

**Entities**

![Conversation Entities](http://images.kevinhoyt.com/watson.workshop.entities.png)

Sometimes the phrases we provide Watson can either be (a) too specific or (b) have variants on which we did not account. Take for example the "place" entity in the screenshot above. When we say "welcome" to Watson, we might be inclined to mention the event, venue, city, etc. Entities allow us to provide synonyms for what might otherwise turn up a common or repeated parts of the phrases in our intents. Think of this as having as many permutations of the intent phrases as there are synonyms.

**Dialog**

![Conversation Dialog](http://images.kevinhoyt.com/watson.workshop.dialog.png)

With Watson trained on the specific intents and the entities that may be found in the conversation, the next step is to map the incoming content with the appropriate response.  The screenshot above shows an example that looks for the "welcome" intent, and further refines it by providing a variation of entities. Next, the phrase Watson should use to respond is provided.

Watson takes time to train. As variations on intents and entities are provided, or as dialog flow changes, Watson will reevaluate the content. Depending on the model, this can take several minutes.

There is also a part of the dialog flow for when there is no match.

**Is Anybody Home?**

An intent does not necessarily need to be mapped to a spoken response. 

In this example application, the transcript of a STT session is passed to an Express instance, where the Watson Conversation API is invoked. The API requires HTTP Basic Authentication using a username and password provided when you register for the service using your IBM Bluemix account. 

    // Discover intent
    router.post( '/intent', function( req, res ) {
	  var hash = null;
      var url = null;
    
      // API endpoint
      // Based on workspace ID
      url =
        req.config.conversation.url +
        WORKSPACE + 
        req.config.conversation.workspace +
        MESSAGE + 
        VERSION;
    
      // Authentication
      // HTTP Basic
	  hash = new Buffer( 
		req.config.conversation.username + 
		':' + 
		req.config.conversation.password
	  ).toString( 'base64' );
	
      request( {
		method: 'POST',
		url: url,	
		headers: {
			'Authorization': 'Basic ' + hash
		},
        json: true,
        body: {
            input: {
                text: req.body.text
            }
        }
	  }, function( err, result, body ) {

		// Moar code ...
 
        // Client gets unparsed body content
		res.send( body );
	  } );
    } );

When a response is returned from Watson to the Express instance, the intent could be processed at the server and additional API calls made in response. As an example, if Watson understands the request of an auto insurance customer to update an account detail, accessing the account detail will depend on that insurance company's specific systems and APIs.

    var data = null;
    var message = null;
                
    // Physical control (IoT)
    // Build message to publish
    if( body.intents[0].intent == 'turn_on' ) {
      // Turn the light on
      message = {
        light: 1    
      };
    } else if( body.intents[0].intent == 'turn_off' ) {
      // Turn the light off
      message = {
        light: 0    
      };
    }

    // IoT oriented intent
    if( message != null ) {
      // Send device command
      req.iot.publish( 
        IOT_TOPIC, 
        JSON.stringify( message ) 
      );            
    }

In this example, the Express instance has been configured to send a message ([MQTT](https://en.wikipedia.org/wiki/MQTT)) to [Watson IoT](https://www.ibm.com/internet-of-things/) (broker), which in turn triggers a relay to turn on or off a physical light fixture plugged into the mains. If an intent related to control of physical devices (IoT) is not found, then the response from the Watson Conversation service is sent to the client (browser), where a response is synthesized using TTS.

**Checkpoint**

Interacting with the Watson Conversation service from a client perspective, in this example application, is little more than making an HTTP request (XHR). The only edit to be made is to include the "**script/conversation/conversation.js**" module in the "**index.html**" document. With this module included, the example application will leverage the Watson Conversation service to synthesize a response.

###Visual Recognition

At this point in the workshop, Watson can hear, speak, and converse with the real world (both humans and machines). The [Visual Recognition](https://www.ibm.com/watson/developercloud/visual-recognition.html) service will give Watson the ability to see the world as well.

**Classifiers**

When you are driving down the highway, and you see another vehicle in the lane next to you, you automatically group it that way in your mind - as a vehicle. It does not matter the brand, size, color, year of the vehicle, it is still that - a vehicle. In machine learning terms, this is called "classification".

The Watson Visual Recognition service automatically includes a default classifier, but Watson can also be trained to have classifiers specific to your business. As an example, if you want to identify your corporate logo in a stream of social media, and be able to respond accordingly.

    // Upload storage options
    // Unique name with extension
    var storage = multer.diskStorage( {
	  destination: 'public/uploads',
      filename: function( req, file, cb ) {
        cb( null, randomstring.generate() + '.jpg' );
      }
    } );

    // Upload handler
    var upload = multer( {
      storage: storage
    } );

    // Classify an image
    router.post( '/recognition', upload.single( 'attachment' ), function( req, res ) {
      var url = null;
    
      // URL using API key
      url = 
        WATSON_CLASSIFY +
        '?api_key=' + req.config.visual.api_key +
        VERSION;
    
      // Multipart file upload to Watson
      request( {
        method: 'POST',
        url: url,
        formData: {
		  parameters: fs.createReadStream( __dirname + '/parameters.json' ),
          images_file: fs.createReadStream( __dirname + '/../' + req.file.path )
        }
      }, function( err, result, body ) {    
        res.send( body );        
      } );    
    } ); 

[Drag-and-drop](http://caniuse.com/#feat=dragndrop) functionality is available in most modern desktop browsers. In this example application, when an image is dropped into the example application, it is uploaded to the Express instance using [XHR2](http://caniuse.com/#feat=xhr2) features. 

Once uploaded to the server, an API call is made to the Watson Visual Recognition service. Two files are sent a form data to the service. The first is a JSON file containing the names of the classifiers to use with this image. The second is the image file itself. I am using "[multer](https://github.com/expressjs/multer)" for file uploads and "[request](https://github.com/request/request)" for HTTP requests from Express.

    {
	  "classifier_ids": [
	    "default",     
	    "Starbucks_1799119863"
	  ],
      "owners": ["me", "IBM"]
    }

Watson will return an array of classes for each of the classifiers specified during the API call. Classes will include the name, confidence score, and a type hierarchy. The example application creates an array of class names, and emits that as an event. The data from that event is passed to the TTS service so that Watson can announce what is in the image.

![Coffee results](http://images.kevinhoyt.com/watson.workshop.coffee.png)

**Face Detection**

The Watson Visual Recognition service is also capable of find faces in a given photo. A bounding box will be returned along with various other metrics. Watson will attempt to place an age and gender on any faces in the provided image. Additionally, Watson has a broad knowledge of famous individuals, and will directly identify them in the results.

![Kevin Hoyt](http://images.kevinhoyt.com/watson.workshop.face.png)

**Collections (BETA)**

The ability for Watson to find images similar to a provided image within a collection of images has also recently been added at a beta stage. This topic is not covered in this workshop.

**Checkpoint**

To add Watson Visual Recognition services to the example application, add "**script/visual/visual.js**" to the "**index.html**" document. Holding the shift key while drapping an image into the example application toggles face detection. Without the shift key being held, Watson will perform image classification.

###Translation

It turns out that not everybody speaks English. Or, rather, that most of the world speaks some language other than English, and you might want to know what they are saying. Maybe you can not even tell what language is in front of you. The [Watson Translation](https://www.ibm.com/watson/developercloud/language-translator.html) service is designed to do just that.

**Languages**

Similar in nature to knowing the voices offered by the TTS service, it is important to know the languages we can translate to and from with Watson.  At the time of this writing there are 62 different languages supported by Watson. Each has a language short code, and a full name associated with it.

![Languages](http://images.kevinhoyt.com/watson.workshop.language.png)

Accessing the Watson Translation service uses HTTP Basic Authentication like STT and TTS. The Watson Visual Recognition service uses an API key as the API was part of an acquisition. Accessing the language listing is an HTTP GET request, using authentication, using a URL provided in the documentation.

    // Identifiable languages
    router.get( '/languages', function( req, res ) {
      var hash = null;
      var url = null;
    
      // API endpoint
      url =
        req.config.translate.url +
        PATH_LANGUAGES;    
    
      // Authentication
      // HTTP Basic
	  hash = new Buffer( 
		req.config.translate.username + 
		':' + 
		req.config.translate.password
	  ).toString( 'base64' );    
    
      request( {
        method: 'GET',
        url: url,
        headers: {
            'Authorization': 'Basic ' + hash
        }
      }, function( err, result, body ) {
        // Client gets unparsed body content        
        res.send( body );
      } );
    } );

**Did You Say Something?**

Translating content on using the Watson Translation service requires three pieces of information. The first piece of information is the language of the content. The second is the language for the translation. And the third is the content to be translation. Effectively: from, to, and content. 

	request( {
		method: 'POST',
		url: url,	
		headers: {
          'Accept': 'application/json',
		  'Authorization': 'Basic ' + hash
		},
        form: {
          source: req.body.source,
          target: req.body.target,
          text: req.body.text
        }
	  }, function( err, result, body ) {
        // Client gets unparsed body content
		res.send( body );
	} );

The "source" and "target" properties use the language code provided by the listing of options from the service. If you are not sure of the source language, the service also provides the ability to identify the language in a separate API. That call is not covered in this workshop.

**You Are a Gringo**

Pairing a translation with the TTS service draws upon the earlier work of getting the list of voices that Watson can synthesize. This is an important consideration. If you pass a Spanish phrase to the "Michael" voice, it will sound like somebody speaking Spanish without any accent or training. 

    TTS.setCurrent( TTS.VOICE_ENRIQUE );
    TTS.say( 'Me gusta jalepenos.' );
    TTS.setCurrent( TTS.VOICE_MICHAEL );
    TTS.say( 'I like jalepenos.' );

Watson Translation returns a JSON string containing an Object with a translation property, and the word count of the phrase original (untranslated) phrase.

![Translation results](http://images.kevinhoyt.com/watson.workshop.translation.png)

**Checkpoint**

To add the module for the Watson Translation service, move the "script" tag for "**script/translate/translate.js**" from the commented block of modules in the "**index.html**" document. For the example application, any content displayed in the prompt at the top of the window is what will be translated. You can trigger the translation by clicking on the words. 

###Natural Language Processing (NLP)

NLP is core to how Watson processes the data provided to it by applications. Understanding the subtleties of language is something humans do effortlessly, but word for word machine translation generally gets wrong. This falls under the [AlchemyLangauge](https://www.ibm.com/watson/developercloud/alchemy-language/api/v1/) service on Watson.

The NLP service is extensive. It can extract concepts and entities, authors and feed URLs. Because it understand language, the service can tell core content and return the raw text. There is also a combined call that can be used to get the most common details in one request, leaving the details up to your application.

    // Process the language of the provided content
    router.post( '/language', function( req, res ) {
	  request( {
		method: 'POST',
		url: req.config.alchemy.url + PATH_COMBINED,	
        form: {
          apikey: req.config.alchemy.api_key,
          outputMode: 'json',
          url: req.body.url
        }
	  }, function( err, result, body ) {
        // Client gets unparsed body content
		res.send( body );
	  } );    
    } );

When the combined request is made, it depends on a publicly available URL.. For the example application, a link can be dropped on the microphone icon. Among the numerous details that are returned, includes an array of concepts found in the linked content. The item with the most relevance is passed to TTS, and the results announced.

![Concept results from a blog post](http://images.kevinhoyt.com/watson.workshop.concepts.png)

###Tone Analysis

Understanding what is in your content is important, making sure what you have to say in your content is equally important. Leveraging NLP, Watson Tone Analysis helps you to understand the tone of your content. Is what you are saying, what your customers are hearing?
