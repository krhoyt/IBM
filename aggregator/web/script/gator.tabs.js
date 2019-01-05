class Tabs extends Observer {
  constructor( icons = false ) {
    super();

    this.root = document.querySelector( 'gator-tabs' );

    let tabs = this.root.querySelectorAll( 'option' );

    for( let t = 0; t < tabs.length; t++ ) {
      let button = document.createElement( 'button' );

      button.innerHTML = tabs[t].innerHTML;
      button.setAttribute( 'data-mode', tabs[t].innerHTML.toLowerCase() );
      button.addEventListener( 'click', ( evt ) => this.doTabClick( evt ) );

      if( icons ) {
        button.classList.add( 'icon' );
        button.style.backgroundImage = `url( img/${tabs[t].getAttribute( 'icon' )}.svg )`;
      } else {
        button.classList.add( 'sans-icon' );
      }
      
      this.root.appendChild( button );
      tabs[t].remove();
    }

    let styles = getComputedStyle( this.root.children[0] );

    this.selector = document.createElement( 'div' );
    this.selector.style.width = styles.width;
    this.root.appendChild( this.selector );
  }

  doTabClick( evt ) {
    let left = 16;

    for( let c = 0; c < this.root.children.length - 1; c++ ) {
      let styles = getComputedStyle( this.root.children[c] );

      if( this.root.children[c] == evt.target ) {
        this.selector.style.left = `${left}px`;
        this.selector.style.width = styles.width;

        this.emit( Tabs.CHANGE, {
          mode: evt.target.getAttribute( 'data-mode' )
        } );

        break;
      } else {
        left = left + parseInt( styles.width );
      }
    }
  }
}

Tabs.CHANGE = 'tabs_change';
