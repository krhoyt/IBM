class Nutrition extends HTMLElement {
  constructor() {
    super();

    // Template
    const template = document.createElement( 'template' );    
    template.innerHTML = `
    <style>
    div.list {
      display: flex;
      flex-direction: column;      
      margin: 0;
      padding: 0;
    }

    div.row {
      border-bottom: solid 1px rgba( 0, 0, 0, 0.12 );      
      display: flex;
      height: 48px;
      flex-direction: row;
    }

    div.row:first-of-type {
      border-top: solid 1px rgba( 0, 0, 0, 0.12 );      
    }

    div.row > p {
      color: rgba( 0, 0, 0, 0.87 );
      font-family: 'IBM Plex Sans', sans-serif;
      font-size: 16px;
      font-weight: 400;
      height: 48px;
      line-height: 48px;
      margin: 0;
      padding: 0;
    }

    div.row > p:first-of-type {
      flex-basis: 0;
      flex-grow: 1;
    }

    div.row > p:last-of-type {
      color: #7FD1D0;
      font-weight: 500;      
    }
    </style>

    <div class="list"></div>
    `;

    // Properties
    this._limit = 7;
    this._classification = [];

    // Shadow
    this._shadowRoot = this.attachShadow( {mode: 'open'} );
    this._shadowRoot.appendChild( template.content.cloneNode( true ) );    

    // List
    this.$list = this._shadowRoot.querySelector( 'div.list' );
  }

  // Exposed attributes
  static get observedAttributes() {
    return ['limit', 'classification'];
  }

  // Changed
  attributeChangedCallback( name, oldValue, newValue ) {
    switch( name ) {
      case 'limit':
        console.log( 'Nutrition (limit): ' + newValue );
        this.limit = newValue;
        break;

      case 'classification':
        this.classification = newValue;
        break;
    }
  }  

  // Show results
  _render() {
    // Clean up first
    while( this.$list.children.length > 0 ) {
      this.$list.children[0].remove();
    }

    const count = Math.min( this._limit, this._classification.length );

    for( let c = 0; c < count; c++ ) {
      const row = document.createElement( 'div' );
      row.classList.add( 'row' );
      
      const name = document.createElement( 'p' );
      name.innerHTML = this._classification[c].class;
      row.appendChild( name );

      const value = document.createElement( 'p' );
      value.innerHTML = this._classification[c].score;
      row.appendChild( value );

      this.$list.appendChild( row );
    }
  }

  // Access methods
  get limit() {
    return this._limit;    
  }

  set limit( value ) {
    this._limit = value;
    this._render();
  }

  get classification() {
    return this._classification.slice( 0 );
  }

  set classification( value ) {
    this._classification = value.slice( 0 );
    this._render();
  }
}

window.customElements.define( 'ibm-nutrition', Nutrition );
