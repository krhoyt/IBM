class Tabs {
  constructor() {
    this.root = document.querySelector( '#tabs' );

    this.blog = new Tab( this.root.querySelector( 'button.blog' ) );
    this.twitter = new Tab( this.root.querySelector( 'button.twitter' ) );    
    this.youtube = new Tab( this.root.querySelector( 'button.video' ) );    
    this.github = new Tab( this.root.querySelector( 'button.github' ) );
    this.so = new Tab( this.root.querySelector( 'button.answers' ) );    
  }

  set count( values ) {
    this.blog.count = values.blog;
    this.twitter.count = values.twitter;
    this.youtube.count = values.youtube;
    this.github.count = values.github;
    this.so.count = values.so;
  }

  clear() {
    this.blog.clear();
    this.twitter.clear();
    this.youtube.clear();
    this.github.clear();
    this.so.clear();    
  }
}

class Tab {
  constructor( element ) {
    this.root = element;
    this.tab = this.root.querySelector( 'p:last-of-type' ); 
  }

  set count( value ) {
    this.tab.innerHTML = value;
  }

  clear() {
    this.tab.innerHTML = '-';
  }
}
