class Header extends Observer {
  constructor() {
    super();

    this.root = document.querySelector( 'gator-header' );
    
    this.title = document.createElement( 'p' );
    this.title.innerHTML = this.root.getAttribute( 'title' );
    this.root.appendChild( this.title );

    this.download = document.createElement( 'button' );
    this.download.addEventListener( 'click', ( evt ) => {
      this.emit( Header.DOWNLOAD, null );
    } );
    this.root.appendChild( this.download );
  }
}

Header.DOWNLOAD = 'header_download';
