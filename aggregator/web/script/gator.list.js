class List {
  constructor( element, label = 'Keywords' ) {
    this.root = element;

    this.label = document.createElement( 'p' );
    this.label.innerHTML = label;
    this.root.appendChild( this.label );

    this.list = document.createElement( 'div' );
    this.root.appendChild( this.list );
  }

  get title() {
    return this.label.innerHTML.trim();
  }

  set title( label ) {
    this.label.innerHTML = label;
  }

  clear() {
    while( this.list.children.length > 0 ) {
      this.list.children[0].remove();
    }
  }

  setList( values, word = 'word', count = 'count', label = 'times' ) {
    // To limit to under a certain number of list items
    // let length = List.LENGTH > values.length ? values.length : List.LENGTH;

    for( let v = 0; v < values.length; v++ ) {
      let item = document.createElement( 'div' );
      item.classList.add( 'item' );

      let first = document.createElement( 'p' );
      first.innerHTML = values[v][word];
      item.appendChild( first );

      /*
       * TODO: Consider providing relevant link
      let link = document.createElement( 'a' );
      link.innerHTML = values[v][word];
       */

      let second = document.createElement( 'p' );
      second.innerHTML = values[v][count];
      item.appendChild( second );

      let third = document.createElement( 'p' );
      third.innerHTML = label;
      item.appendChild( third );

      this.list.appendChild( item );
    }
  }
}

List.LENGTH = 8;
