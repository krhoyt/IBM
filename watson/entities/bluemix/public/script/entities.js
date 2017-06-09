class Entities {
  constructor() {
    // Query input
    this.query = document.querySelector( 'input' );
    this.query.addEventListener( 'keydown', evt => this.doKeyDown( evt ) );
    this.query.addEventListener( 'focus', evt => this.doFocus( evt ) );
    this.query.addEventListener( 'blur', evt => this.doBlur( evt ) );
    this.query.focus();

    // Result list
    this.results = document.querySelector( '.results' );

    // Row template
    this.template = document.querySelector( '#row' );

    // Services
    this.xhr = new XMLHttpRequest();
    this.xhr.addEventListener( 'load', evt => this.doResponseLoad( evt ) );
  }

  doBlur( evt ) {
    // Transparent if no value present
    // Stay opaque if a value is present
    if( this.query.value.trim().length == 0 ) {
      this.query.style.opacity = 0.30;
    }
  }

  doFocus( evt ) {
    // Fully opaque when selected
    this.query.style.opacity = 1;
  }

  doKeyDown( evt ) {
    // Catch enter key to submit
    if( evt.keyCode == 13 ) {   
      // Remove existing results 
      while( this.results.children.length > 0 ) {
        this.results.children[0].remove();
      }

      // Analyze query
      // https://www.ibm.com/watson/developercloud/doc/conversation/system-entities.html#sys-datetime
      this.xhr.open( 'POST', Entities.WHISK_PATH, true );
      this.xhr.setRequestHeader( 'Content-Type', 'application/json' );
      this.xhr.send( JSON.stringify( {
        message: this.query.value.trim()
      } ) );
    }
  }

  doResponseLoad( evt ) {
    let data = JSON.parse( this.xhr.responseText );

    // Debug
    console.log( data );

    for( let entity of data.entities ) {
      // Get entity type
      let dash = entity.entity.indexOf( '-' ) + 1;

      // Get word from query
      let word = this.query.value.substring( 
        entity.location[0], 
        entity.location[1] 
      ).trim();

      // Populate template
      this.template.content.querySelector( 'p:nth-of-type( 1 )' ).innerHTML = entity.entity.substr( dash );
      this.template.content.querySelector( 'p:nth-of-type( 2 )' ).innerHTML = word;
      this.template.content.querySelector( 'p:nth-of-type( 3 )' ).innerHTML = entity.value.trim();
      this.template.content.querySelector( 'p:nth-of-type( 4 )' ).innerHTML = Math.round( entity.confidence * 100 ) + '%';    

      // Clone into document
      let clone = document.importNode( this.template.content, true );
      this.results.appendChild( clone );

      // Debug
      console.log( entity );
    }
  }
}

// Node.js server or OpenWhisk action
Entities.LOCAL_PATH = '/api/conversation/message';
Entities.WHISK_PATH = 'https://openwhisk.ng.bluemix.net/api/v1/web/krhoyt%40us.ibm.com_dev/watson/conversation.entities';

// Off we go!
let app = new Entities();
