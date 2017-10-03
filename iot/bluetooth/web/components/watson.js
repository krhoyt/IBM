class Watson {

  constructor() {
    // Phrase to be spoken
    this.phrase = null;

    // XHR for authentication token
    this.xhr = null;    
  }

  // Have Watson say something
  // TTS (Text-to-Speech)
  say( phrase ) {
    // Need to get authentication token first
    // Store desired phrase in the meantime
    this.phrase = phrase;

    // Request authentication token
    // OpenWhisk web action
    this.xhr = new XMLHttpRequest();
    this.xhr.addEventListener( 'load', evt => this.doToken( evt ) );
    this.xhr.open( 'GET', Watson.TOKEN, true );
    this.xhr.send( null );
  }

  // Watson token retrieved
  // Synthesize provided phrase
  doToken( evt ) {
    WatsonSpeech.TextToSpeech.synthesize( {
      text: this.phrase,
      token: this.xhr.responseText
    } );

    // Clean up
    this.xhr.removeEventListener( 'load', this.doToken );
    this.xhr = null;    
  }

}

// OpenWhisk web action endpoint
Watson.TOKEN = 'https://openwhisk.ng.bluemix.net/api/v1/experimental/web/krhoyt@us.ibm.com_dev/watson/tts.token.text/body';
