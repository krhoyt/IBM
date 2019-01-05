class Version {
  constructor() {
    this.root = document.querySelector( 'gator-version' );
    
    this.contact = document.createElement( 'p' );
    
    this.link = document.createElement( 'a' );
    this.link.href = `mailto:${this.root.getAttribute( 'contact' )}`;
    this.link.innerHTML = this.root.getAttribute( 'contact' );
    this.contact.appendChild( this.link );

    this.root.appendChild( this.contact ) 

    this.version = document.createElement( 'div' );

    this.label = document.createElement( 'p' );
    this.label.innerHTML = 'Version:';
    this.version.appendChild( this.label );

    this.release = document.createElement( 'p' );
    this.release.innerHTML = this.root.getAttribute( 'release' );
    this.version.appendChild( this.release );

    this.root.appendChild( this.version );
  }
}
