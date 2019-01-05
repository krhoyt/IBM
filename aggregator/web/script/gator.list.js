class List {
  constructor( element, label = 'Keywords' ) {
    this.root = element;

    this.label = document.createElement( 'p' );
    this.label.innerHTML = label;
    this.root.appendChild( this.label );
  }

  get title() {
    return this.label.innerHTML.trim();
  }

  set title( label ) {
    this.label.innerHTML = label;
  }

  clear() {
    while( this.root.children.length > 1 ) {
      this.root.children[this.root.children.length - 1].remove();
    }
  }

  setList( values, word = 'word', count = 'count', label = 'times' ) {
    let length = List.LENGTH > values.length ? values.length : List.LENGTH;

    for( let v = 0; v < length; v++ ) {
      let item = document.createElement( 'div' );
      item.classList.add( 'item' );

      let first = document.createElement( 'p' );
      first.innerHTML = values[v][word];
      item.appendChild( first );

      let second = document.createElement( 'p' );
      second.innerHTML = values[v][count];
      item.appendChild( second );

      let third = document.createElement( 'p' );
      third.innerHTML = label;
      item.appendChild( third );

      this.root.appendChild( item );
    }
  }
}

List.LENGTH = 8;
