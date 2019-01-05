class Header {
  constructor() {
    this.root = document.querySelector( 'gator-header' );
    
    this.title = document.createElement( 'p' );
    this.title.innerHTML = this.root.getAttribute( 'title' );
    this.root.appendChild( this.title );
  }
}
