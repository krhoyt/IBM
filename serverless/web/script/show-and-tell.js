class ShowAndTell {
  constructor() {
    // Watson for Text To Speech (TTS)
    // Need token for authorization
    // Call IBM Cloud Function to generate token
    // Ready when needed
    this.token = null;

    fetch( ShowAndTell.WATSON_TOKEN )
    .then( ( response ) => {return response.text();} )
    .then( ( token ) => {
      console.log( 'Token' );
      this.token = token;
    } );

    // PubNub for publish/subscribe
    // Just subscribe in this example
    // Listen on channel for messages
    this.pubnub = new PubNub( {
      publishKey: ShowAndTell.PUBNUB_PUBLISH,
      subscribeKey: ShowAndTell.PUBNUB_SUBSCRIBE
    } );
    this.pubnub.addListener( {
      status: ( evt ) => {
        console.log( evt );
      },
      message: ( evt ) => {
        console.log( evt );

        // Sort classification results
        const sorted = evt.message.classification.images[0].classifiers[0].classes.sort( ( a, b ) => {
          if( a.score > b.score ) return -1;
          if( a.score < b.score ) return 1;
          return 0;
        } );

        // Assemble the top results into a sentence
        let limit = 0.90;
        let sentence = null;        

        // Result may be less than 90% accurate
        // Keep dropping limit until results
        do {
          for( let c = 0; c < sorted.length; c++ ) {
            if( sorted[c].score < limit ) {
              continue;
            }
  
            if( c === 0 ) {
              sentence = sorted[c].class;
            } else {
              sentence = sentence + ' ' + sorted[c].class;
            }
          }

          limit = limit - 0.10;
        } while( sentence === null )

        // Display the results
        this.tell.classification = sorted;

        // Use Watson to speak results
        // Take top two results for sentence
        WatsonSpeech.TextToSpeech.synthesize( {
          text: sentence,
          access_token: this.token
        } );
      }
    } );
    this.pubnub.subscribe( {
      channels: [ShowAndTell.PUBNUB_CHANNEL] 
    } );        

    // Allow user to select image file
    // Display the image file when selected
    // Additionally upload
    // Upload to IBM Cloud Function
    // IBM Cloud Function stores on IBM Cloud Object Storage
    this.show = document.querySelector( 'ibm-show' );
    this.show.addEventListener( 'upload', ( evt ) => {
      // Clear previous
      this.tell.classification = [];

      // Keep extension
      const start = evt.detail.file.name.lastIndexOf( '.' );
      const extension = evt.detail.file.name.substring( start );
  
      // Build form
      const form = new FormData();
      form.append( 'file', evt.detail.file );
      form.append( 'bucket', 'show-and-tell' );
      form.append( 'name', `${Date.now()}${extension}` );
  
      // Upload
      fetch( ShowAndTell.IBM_UPLOAD, {
        method: 'POST',
        body: form
      } )
      .then( ( response ) => {return response.json();} )
      .then( ( data ) => {
        console.log( data );
      } );
    } );

    // Display results in a basic list
    // Wishes it could be the show component
    this.tell = document.querySelector( 'ibm-tell' );

    // Logo
    // With Easter Egg
    this.logo = document.querySelector( 'ibm-logo' );
    this.logo.addEventListener( 'easter', ( evt ) => {
      if( this.film.clientHeight > 0 ) {
        this.film.style.height = 0;
      } else {
        fetch( `${ShowAndTell.IBM_LIST}?bucket=${ShowAndTell.COS_BUCKET}` )
        .then( ( response ) => {return response.json();} )
        .then( ( data ) => {
          console.log( data );

          const sorted = data.sort( ( a, b ) => {
            const modified_a = new Date( a.modified );
            const modified_b = new Date( b.modified );

            if( modified_a.getTime() < modified_b.getTime() ) return 1;
            if( modified_a.getTime() > modified_b.getTime() ) return -1;
            return 0;
          } );

          this.film.images = sorted;
        } );

        // this.film.images = sorted;
        this.film.style.height = ShowAndTell.FILM_HEIGHT;
      }
    } );

    // Film strip
    // Easter egg
    this.film = document.querySelector( 'ibm-film' );
  }
}

ShowAndTell.COS_BUCKET = 'show-and-tell';
ShowAndTell.FILM_HEIGHT = '150px';
ShowAndTell.IBM_UPLOAD = 'https://us-south.functions.cloud.ibm.com/api/v1/web/krhoyt%40us.ibm.com_dev/showtell/show';    
ShowAndTell.IBM_LIST = 'https://us-south.functions.cloud.ibm.com/api/v1/web/krhoyt%40us.ibm.com_dev/showtell/list';
ShowAndTell.PUBNUB_CHANNEL = 'tell';
ShowAndTell.PUBNUB_PUBLISH = 'pub-c-96544df0-d5e9-4fc3-b682-d706f4d7503a';
ShowAndTell.PUBNUB_SUBSCRIBE = 'sub-c-affc5b10-6146-11e9-b9ce-c68ae278081b';
ShowAndTell.WATSON_TOKEN = 'https://us-south.functions.cloud.ibm.com/api/v1/web/krhoyt%40us.ibm.com_dev/showtell/token';    

// Main
const app = new ShowAndTell();
