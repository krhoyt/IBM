class Captions {
  // Constructor
  constructor() {
    // Holds audio dialog
    this.conversation = [];

    // Watson logo 
    // Used as proxy for file selector
    // Allowing for customization of interaction
    let watson = document.querySelector( 'button.file' );
    watson.addEventListener( 'click', ( evt ) => this.doWatsonClick( evt ) );

    // The actual file selector
    // Not shown in the user interface
    this.selector = document.querySelector( 'input[type="file"]' );    
    this.selector.addEventListener( 'change', (  evt ) => this.doSelectorChange( evt ) );

    // Instructions
    // Progress
    // Dialog
    this.copy = document.querySelector( 'p.copy' );

    // Playback control
    this.waveform = document.querySelector( '.waveform' );

    // Waveform display
    // Display dialog for progress
    // Reset when finished playing
    this.audio = WaveSurfer.create( {
      container: 'div.audio',
      waveColor: Captions.WAVEFORM_WAVE,
      progressColor: Captions.WAVEFORM_PROGRESS,
      height: Captions.WAVEFORM_HEIGHT
    } );    
    this.audio.on( 'audioprocess', () => this.doAudioProcess() );
    this.audio.on( 'finish', () => this.doAudioFinish() );

    // Play/pause button
    this.play = document.querySelector( 'button.play' );
    this.play.addEventListener( 'click', ( evt ) => this.doPlayClick( evt ) );
  }

  // Called when audio has finished playing
  doAudioFinish() {
    // Stop audio
    // Reset playhead to start
    this.audio.stop();

    // Update button to reflect status
    this.play.classList.remove( 'pause' );
    this.play.classList.add( 'play' );
  }

  // Called as the audio plays
  // Updates the dialog accordingly
  doAudioProcess() {
    // Timing for audio
    const timing = this.audio.getCurrentTime();
    let found = false;    

    // Look through dialog for matching interval
    for( let c = 0; c < this.conversation.length; c++ ) {
      if( timing >= this.conversation[c][1] && timing < this.conversation[c][2] ) {
        // Display copy for that interval
        this.copy.innerHTML = this.conversation[c][0];
        found = true;
        break;
      }
    }

    // No matching interval
    // Display nothing
    if( !found ) {
      this.copy.innerHTML = '&nbsp;';
    }
  }

  // Called when the play button is clicked
  doPlayClick( evt ) {  
    // Play/pause audio    
    this.audio.playPause();

    // Update icon to reflect status
    // Now playing
    if( this.audio.isPlaying() ) {
      this.play.classList.remove( 'play' );
      this.play.classList.add( 'pause' );      
    } else {
      // No longer playing
      this.play.classList.remove( 'pause' );
      this.play.classList.add( 'play' );      
    }
  }

  // Called when a file selection is made
  // When different selection
  doSelectorChange( evt ) {
    // Clear copy
    // Fill with progress indicator
    this.copy.innerHTML = '&nbsp;';
    this.copy.classList.add( 'spinner' );

    // Hide audio waveform and playback
    this.waveform.style.bottom = `${0 - this.waveform.clientHeight}px`;

    // Wait for animation to complete
    // Then load new waveform
    setTimeout( () => {
      this.audio.loadBlob( evt.target.files[0] );
    }, 1000 );

    // Prepare form with selected file
    let form = new FormData();
    form.append( 'file', evt.target.files[0] );
    form.append( 'type', evt.target.files[0].type );

    // Upload to server for processing
    // IBM Cloud Function <-> Watson
    fetch( `${Captions.WATSON_PATH}?${Captions.WATSON_PARAMS}`, {
      method: 'POST',    
      body: form
    } )
    .then( ( response ) => {return response.json();} )
    .then( (data ) => {
      // Extract words used in audio
      this.conversation = [];

      for( let r = 0; r < data.results.length; r++ ) {
        this.conversation = this.conversation.concat( data.results[r].alternatives[0].timestamps );
      }

      // Remove progress indicator
      this.copy.classList.remove( 'spinner' );

      // Display the audio playback control
      this.waveform.style.bottom = `${Captions.WAVEFORM_BOTTOM}px`;

      // Debug
      console.log( data );
    } );
  }

  // Called when Watson logo is clicked
  // Opens file selection dialog
  doWatsonClick( evt ) {
    this.selector.click();
  }
}

// Static
Captions.WATSON_PARAMS = 'speaker_labels=true';
Captions.WATSON_PATH = 'https://openwhisk.ng.bluemix.net/api/v1/web/krhoyt%40us.ibm.com_dev/watson/stt.recognize';
Captions.WAVEFORM_BOTTOM = 16;
Captions.WAVEFORM_HEIGHT = 48;
Captions.WAVEFORM_PROGRESS = '#016158';
Captions.WAVEFORM_WAVE = '#00b2b2';

// Main
const app = new Captions();
