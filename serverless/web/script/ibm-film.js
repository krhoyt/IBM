class Film extends HTMLElement {
  constructor() {
    super();

    // Template
    const template = document.createElement( 'template' );    
    template.innerHTML = `
    <style>
    :host {
      background-image: url( img/background.jpg );      
      height: 0;
      transition: height 0.80s;
      z-index: -100;
    }
    
    div.strip {
      height: 150px;
      overflow-x: auto;
      white-space: nowrap;      
    }

    div.thumbnail {
      background-color: #F3F3F3;
      background-position: center;
      background-size: cover;
      border: solid 5px white;
      border-radius: 4px;
      box-shadow: 0 2px 4px 0 rgba( 0, 0, 0, 0.60 );
      float: left;
      height: 108px;
      margin: 16px 0 0 16px;
      width: 108px;
    }

    div.thumbnail:last-of-type {
      margin: 16px 16px 0 16px;
    }
    </style>

    <!-- List -->
    <div class="strip"></div>
    `;

    // Shadow
    this._shadowRoot = this.attachShadow( {mode: 'open'} );
    this._shadowRoot.appendChild( template.content.cloneNode( true ) );    

    // List
    this.$strip = this._shadowRoot.querySelector( 'div.strip' );
  }

  get images() {
    let results = [];
    
    // Build results from data attributes
    // Copied from original object when added
    for( let c = 0; c < this.$strip.children.length; c++ ) {
      results.push( {
        modified: this.$strip.children[c].getAttribute( 'data-modified' ),
        name: this.$strip.children[c].getAttribute( 'data-name' ),
        size: this.$strip.children[c].getAttribute( 'data-size' ),
        type: this.$strip.children[c].getAttribute( 'data-type' )
      } );
    }

    return results;
  }

  set images( values ) {
    // Iterate the images
    for( let v = 0; v < values.length; v++ ) {
      let found = false;

      // Look to see if the image has already been added
      // Do not add the image again
      // List of image is sorted with newest first
      for( let c = 0; c < this.$strip.children.length; c++ ) {
        if( this.$strip.children[c].getAttribute( 'data-name' ) === values[v].name ) {
          found = true;
          break;
        }
      }

      // Image not found
      // Add to list
      if( !found ) {
        // Element
        const element = document.createElement( 'div' );
        element.title = values[v].name;
        element.classList.add( 'thumbnail' );
        element.style.backgroundImage = `url( ${Film.IBM_OBJECT}?bucket=${Film.COS_BUCKET}&key=${values[v].name} )`;
        
        // Copy over properties as data attributes
        const keys = Object.keys( values[v] );

        for( let k = 0; k < keys.length; k++ ) {
          element.setAttribute( `data-${keys[k]}`, values[v][keys[k]] );
        }

        // Append if the first
        // Put at front of list if images exist
        // Allows new images to be added
        // Via toggle of displaying list
        // Show up immediatedly in the front
        if( this.$strip.children.length === 0 ) {
          this.$strip.appendChild( element );
        } else {
          this.$strip.insertBefore( element, this.$strip.children[0] );
        }
      }
    }
  }
}

Film.COS_BUCKET = 'show-and-tell';
Film.IBM_OBJECT = 'https://us-south.functions.cloud.ibm.com/api/v1/web/krhoyt%40us.ibm.com_dev/showtell/object';

window.customElements.define( 'ibm-film', Film );
