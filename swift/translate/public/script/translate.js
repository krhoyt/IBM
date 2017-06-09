class Translate {
  constructor() {
    // Text input
    // Phrase
    this.text = document.querySelector( '.text' );
    this.text.addEventListener( 'focus', evt => this.doFocus( evt ) );
    this.text.addEventListener( 'blur', evt => this.doBlur( evt ) );

    // Form references
    this.source = document.querySelector( '.source' );
    this.target = document.querySelector( '.target' );
    this.translate = document.querySelector( '.translate' );
    this.source = document.querySelector( '.source' );
    this.target = document.querySelector( '.target' );

    // Submit button
    this.button = document.querySelector( 'button' );
    this.button.addEventListener( 'click', evt => this.doTranslate( evt ) );
    
    // Service
    this.xhr = new XMLHttpRequest();
    this.xhr.addEventListener( 'load', evt => this.doLoad( evt ) );
  }

  // Fade if no content
  doBlur( evt ) {
    if( this.text.value.trim().length == 0 ) {
      this.text.style.opacity = 0.30;
    }
  }

  // Opaque while typing
  doFocus( evt ) {
    this.text.style.opacity = 1;
  }

  // Parse service results
  // Display on screen
  // Debug output of object
  doLoad( evt ) {
    let data = JSON.parse( this.xhr.responseText );    
    this.translate.innerHTML = data.translations[0].translation
    console.log( data );
  }

  // Perform translation
  // Validate
  // Call service
  doTranslate( evt ) {
    // Check phrase has been entered
    if( this.text.value.trim().length == 0 ) {
      alert( 'Enter a phrase to translate.' );
      return; 
    }

    // Check that English is at least one of the languages
    if( this.source.value != 'en' && this.target.value != 'en' ) {
      alert( 'Source or target must be English.' );
      return;
    }

    // Make sure both languages are not English
    if( this.source.value == 'en' && this.target.value == 'en' ) {
      alert( 'Same language, duh!' );
      return;
    }

    // Prepare data
    let data = {
      source: this.source.value,
      target: this.target.value,
      text: this.text.value.trim()
    }

    // Call service
    this.xhr.open( 'POST', '/api/translate', true );
    this.xhr.setRequestHeader( 'Content-Type', 'application/json' );
    this.xhr.send( JSON.stringify( data ) );
  }
}

// Application
let app = new Translate();
