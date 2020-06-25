class Prompt extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = `
    <style>
    :host {
      align-items: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    p:first-of-type {
      border-radius: 36px;
      border: solid 3px #7FD1D0;
      color: #7FD1D0;
      font-family: 'IBM Plex Sans', sans-serif;
      font-size: 36px;
      font-weight: 600;
      height: 50px;
      line-height: 50px;
      margin: 0 0 18px 0;
      padding: 0;
      text-align: center;
      width: 50px;
    }

    p:last-of-type {
      color: rgba( 0, 0, 0, 0.87 );      
      font-family: 'IBM Plex Sans', sans-serif;
      font-size: 24px;
      font-weight: 500;      
      margin: 0;
      padding: 0;
    }
    </style>

    <!-- Step -->
    <p>1</p>

    <!-- Instructions -->
    <p>Drag and drop an image file here ...</p>
    `;

    // Shadow
    this._shadowRoot = this.attachShadow( {mode: 'open'} );
    this._shadowRoot.appendChild( template.content.cloneNode( true ) );    

    // Element references
    this.$step = this._shadowRoot.querySelector( 'p:first-of-type' );
    this.$message = this._shadowRoot.querySelector( 'p:last-of-type' );
  }

  // Exposed attributes
  static get observedAttributes() {
    return ['step', 'message'];
  }

  // Changed
  attributeChangedCallback( name, oldValue, newValue ) {
    switch( name ) {
      case 'step':
        this.step = newValue;
        break;

      case 'message':
        this.message = newValue;
        break;
    }
  }

  // Access methods
  get step() {
    return parseInt( this.$step.innerHTML.trim() );
  }

  set step( value ) {
    this.$step.innerHTML = value;
  }

  get message() {
    return this.$message.innerHTML.trim();
  }

  set message( value ) {
    this.$message.innerHTML = value;
  }
}

window.customElements.define( 'ibm-prompt', Prompt );
