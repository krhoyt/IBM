class Logo extends HTMLElement {
  constructor() {
    super();

    // Template
    const template = document.createElement( 'template' );    
    template.innerHTML = `
    <style>
    :host {
      display: flex;
      flex-direction: row;
      justify-content: center;
      left: 0;
      position: absolute;
      top: -58px;
      right: 0;
    }

    div{
      background-color: white;
      background-image: url( img/ibm.svg );
      background-position: center bottom 20px;
      background-repeat: no-repeat;
      background-size: 50px; 
      border: solid 8px #F3F3F3;
      border-radius: 60px;
      height: 100px;
      margin: 0;
      padding: 0;
      width: 100px;
    }
    </style>
    <div></div>
    `;

    // Link (href)
    this._href = null;

    // Shadow
    this._shadowRoot = this.attachShadow( {mode: 'open'} );
    this._shadowRoot.appendChild( template.content.cloneNode( true ) );    

    // Logo
    // Click to load link
    this.$logo = this._shadowRoot.querySelector( 'div' );
    this.$logo.addEventListener( 'click', ( evt ) => {
      if( evt.shiftKey === true ) {
        this.dispatchEvent( new CustomEvent( 'easter', null ) );
      } else {
        window.open( this.href, '_blank' );
      }
    } );
  }

  // Attributes
  // Link (href)
  static get observedAttributes() {
    return ['href'];
  }

  // Attributes hanged (set)
  // Link (href)
  attributeChangedCallback( name, oldValue, newValue ) {
    switch( name ) {
      case 'href':
        this.href = newValue;
        break;
    }
  }

  // Access methods
  // For link (href)
  get href() {
    return this._href;
  }

  set href( value ) {
    this._href = value;
  }
}

window.customElements.define( 'ibm-logo', Logo );
