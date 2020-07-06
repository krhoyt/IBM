class Show extends HTMLElement {
  constructor() {
    super();

    // Template
    const template = document.createElement( 'template' );
    template.innerHTML = `
    <style>
    :host {
      align-items: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    button {
      background: none;
      background-color: #7FD1D0;
      border: none;
      border-radius: 2px;
      color: white;
      font-family: 'IBM Plex Sans', sans-serif;
      font-size: 14px;
      font-weight: 600;      
      height: 36px;
      margin: 18px 0 0 0;
      outline: none;
      padding: 0 16px 0 16px;
      text-transform: uppercase;
    }

    div {
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;
      display: none;
      width: 80%;
    }

    img {
      left: 0;
      position: absolute;
      top: 0;
      visibility: hidden;
    }

    input {
      display: none;
    }
    </style>
    <!-- Instructions -->
    <ibm-prompt step="1" message="Drag and drop an image file here ..."></ibm-prompt>

    <!-- Display image -->
    <!-- Sized to fit in component -->
    <!-- Not initially visible -->
    <div></div>    

    <!-- Manual selection -->
    <button>Choose ...</button>    

    <!-- Manual selection -->
    <!-- Hidden -->
    <input type="file">

    <!-- Dimensions -->
    <!-- Hidden -->
    <img>
    `;

    // Shadow
    this._shadowRoot = this.attachShadow( {mode: 'open'} );
    this._shadowRoot.appendChild( template.content.cloneNode( true ) );    

    // Drag and drop 
    // On component host
    this._shadowRoot.host.addEventListener( 'dragover', ( evt ) => {
      // Do not display (default)
      evt.stopPropagation();
      evt.preventDefault();
      evt.dataTransfer.dropEffect = 'copy';
    } );
    this._shadowRoot.host.addEventListener( 'drop', ( evt ) => {
      console.log( evt );

      // Do not display (default)
      evt.stopPropagation();
      evt.preventDefault();

      // Display and upload file
      this._upload( evt.dataTransfer.files[0] );
    } );

    // Instructions
    // Drop zone
    this.$prompt = this._shadowRoot.querySelector( 'ibm-prompt' );

    // Display image
    this.$holder = this._shadowRoot.querySelector( 'div' );

    // Hidden input of type file
    // Used for manual selection
    // Display and upload file
    this.$input = this._shadowRoot.querySelector( 'input' );
    this.$input.addEventListener( 'change', ( evt ) => {
      console.log( evt.target.files );
      this._upload( evt.target.files[0] );
    } );

    // Choose button
    // Trigger file selection
    this.$choose = this._shadowRoot.querySelector( 'button' );
    this.$choose.addEventListener( 'click', ( evt ) => {
      console.log( 'Choosing' );
      this.$input.click();
    } );    

    // Dimensions
    this.$dimensions = this._shadowRoot.querySelector( 'img' );
    this.$dimensions.addEventListener( 'load', ( evt ) => {
      console.log( `${this.$dimensions.width}x${this.$dimensions.height}` );

      // Hide instructions
      this.$prompt.style.display = 'none';

      // Ratio of image to display area
      const width = this._shadowRoot.host.clientWidth * 0.80;
      const ratio = width / parseInt( this.$dimensions.width );
      const height = parseInt( this.$dimensions.height ) * ratio;

      // Display image
      this.$holder.style.height = Math.round( height ) + 'px';
      this.$holder.style.display = 'block';
    } );    
  }

  _upload( file ) {
    // Read the selected file
    // Either drag/drop or manual
    const reader = new FileReader();
    reader.addEventListener( 'load', ( evt ) => {
      console.log( 'Read' );

      // Place into display
      this.$holder.style.backgroundImage = `url( ${evt.target.result} )`;      

      // Also put into image element
      // Element returns specific dimensions
      this.$dimensions.src = evt.target.result;
    } );
    reader.readAsDataURL( file );

    // Ask for file to be uploaded
    // Responsibility of main application (controller)
    this.dispatchEvent( new CustomEvent( 'upload', {
      detail: {
        file: file
      }
    } ) );
  }
}

window.customElements.define( 'ibm-show', Show );
