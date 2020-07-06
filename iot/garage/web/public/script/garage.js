class Garage {
  constructor() {
    // Audio stream
    this.stream = null;

    // Removable event handler
    // Transcript arrived from Watson
    this.doTranscript = this.doTranscript.bind( this );

    // Element to display transcript results
    this.transcript = document.querySelector( '#transcript' );
    
    // Button to trigger STT session
    this.talk = document.querySelector( '#watson > button' );
    this.talk.addEventListener( 'click', ( evt ) => this.doTalk( evt ) );

    // Listen for network events
    // Processing from remote device
    this.socket = io();
    this.socket.on( 'garage', evt => this.doGarage( evt ) );

    // Load and register indicator sound
    createjs.Sound.registerSounds( [
      {id: Garage.AUDIO_NAME, src: Garage.AUDIO_PATH}
    ] );
  }

  // Device result
  doGarage( evt ) {
    // Debug
    console.log( evt );

    // Remove processing animation
    this.talk.parentElement.classList.remove( 'processing' );

    // Shortcut for result
    const result = evt.images[0].classifiers[0].classes[0].class;

    // Display results
    // Either open or closed
    // TODO: Better error handling
    // TODO: Moar classifiers!
    if( result.indexOf( Garage.STATE_OPEN ) >= 0 ) {
      this.transcript.innerHTML = Garage.MESSAGE_OPEN;
    } else if( result.indexOf( Garage.STATE_CLOSED ) >= 0 ) {
      this.transcript.innerHTML = Garage.MESSAGE_CLOSED;
    }      

    // Get authentication token
    // Have Watson speak the result
    fetch( Garage.TTS_TOKEN )
    .then( ( response ) => {return response.text();} )
    .then( ( token ) => {
      WatsonSpeech.TextToSpeech.synthesize( {
        text: this.transcript.innerHTML,
        token: token
      } );
    } );
  }

  // Start Watson session
  doTalk( evt ) {
    // Play notification sound
    // Let the user know we are doing something
    createjs.Sound.play( Garage.AUDIO_NAME );

    // Get authentication token
    // Fire up WebRTC microphone capture
    fetch( Garage.STT_TOKEN )
    .then( ( response ) => {return response.text();} )
    .then( ( token ) => {
      // Show listening animation
      this.talk.parentElement.classList.add( 'listening' );

      // Listen for audio stream on microphone
      this.stream = WatsonSpeech.SpeechToText.recognizeMicrophone( {
        objectMode: true,
        token: token,
        format: false,
        extractResults: true
      } );
      this.stream.addListener( 'data', this.doTranscript );
    } );
  }

  // Results from audio stream
  doTranscript( data ) {
    // Debug
    console.log( data );

    // Got final result
    if( data.final === true ) {
      // Shortcut result text
      const transcript = data.alternatives[0].transcript.trim();

      // Look for keyword to trigger remote analysis
      if( transcript.indexOf( Garage.KEYWORD ) >= 0 ) {
        // Send request to remote device
        this.socket.emit( Garage.COMMAND, {
          label: Garage.KEYWORD
        } );

        // Show processing animation
        this.talk.parentElement.classList.add( 'processing' );              
      }

      // Remove listening animation
      // Keyword not detected
      this.talk.parentElement.classList.remove( 'listening' );

      // Stop audio stream
      // Clean up event listener
      this.stream.stop();
      this.stream.removeListener( 'data', this.doTranscript );

      // Show results either way
      this.transcript.innerHTML = transcript;
    }
  }
}

// Constants
Garage.AUDIO_NAME = 'siri';
Garage.AUDIO_PATH = 'audio/siri.mp3';
Garage.COMMAND = 'monitor';
Garage.KEYWORD = 'garage';
Garage.MESSAGE_OPEN = 'The garage door is open.';
Garage.MESSAGE_CLOSED = 'The garage door is closed.';
Garage.STATE_OPEN = 'open';
Garage.STATE_CLOSED = 'closed';
Garage.STT_TOKEN = '/api/stt/token';
Garage.TTS_TOKEN = '/api/tts/token';

// Main entry
let app = new Garage();
