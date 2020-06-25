class Tell extends HTMLElement {
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
      margin: 0;
      padding: 0;
    }

    ibm-nutrition {
      width: 60%;
    }

    ibm-nutrition.start {
      height: 36px;
      margin: 18px 0 0 0;      
      padding: 0;      
    }
    </style>

    <!-- Instructions -->
    <ibm-prompt step="2" message="... results will appear here."></ibm-prompt>

    <!-- Results -->
    <!-- Balances out UI before populated -->
    <ibm-nutrition class="start"></ibm-nutrition>
    `;

    // Shadow
    this._shadowRoot = this.attachShadow( {mode: 'open'} );
    this._shadowRoot.appendChild( template.content.cloneNode( true ) );    

    // Instructions
    this.$prompt = this._shadowRoot.querySelector( 'ibm-prompt' );

    // Nutrition
    this.$nutrition = this._shadowRoot.querySelector( 'ibm-nutrition' );
  }

  // Exposed attributes
  static get observedAttributes() {
    return ['classification'];
  }

  // Changed
  // Pass on to specific component
  attributeChangedCallback( name, oldValue, newValue ) {
    switch( name ) {
      case 'classification':
        this.classification = newValue;
        break;
    }
  }  

  // Access methods
  get classification() {
    return this.$nutrition.classification;
  }

  set classification( value ) {
    if( value.length > 0 ) {
      this.$nutrition.classList.remove( 'start' );
      this.$prompt.style.display = 'none';
    } else {
      this.$nutrition.classList.add( 'start' );
      this.$prompt.style.display = 'flex';
    }

    this.$nutrition.classification = value;
  }
}

window.customElements.define( 'ibm-tell', Tell );
