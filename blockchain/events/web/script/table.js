class Table {
  constructor() {
    this.root = document.querySelector( '.table' );    
    this.row = document.querySelector( '.row.template' );    
    
    this.list = this.root.querySelector( '.list' );
  }

  update( value ) {
    // Find affected row
    let row = this.list.querySelector( '.row[data-symbol=\'' + value.symbol + '\']' );
    
    // Animate highlight
    row.classList.add( 'blink' );

    // Update appropriate cells
    row.children[3].innerHTML = value.last.toFixed( 2 );      
    row.children[3].style.color = value.change > 0 ? Table.COLOR_GREEN : Table.COLOR_RED;
    row.children[4].innerHTML = value.change.toFixed( 2 );      
    row.children[4].style.color = value.change > 0 ? Table.COLOR_GREEN : Table.COLOR_RED;            
  }

  doAnimationEnd( evt ) {
    evt.target.classList.remove( 'blink' );
  }

  set data( value ) {    
    // Clean up
    while( this.list.children.length > 0 ) {
      this.list.children[0].remove();
    }

    // Build list
    for( let s = 0; s < value.length; s++ ) {
      let row = this.row.cloneNode( true );

      // Handle animation of background
      // Track the symbol
      // No longer a template
      row.addEventListener( 'animationend', evt => this.doAnimationEnd( evt ) );
      row.setAttribute( 'data-symbol', value[s].symbol );
      row.classList.remove( 'template' );

      // Populate cells
      // Color indications where appropriate
      row.children[0].innerHTML = value[s].symbol;
      row.children[1].innerHTML = value[s].name;
      row.children[2].innerHTML = value[s].open.toFixed( 2 );
      row.children[3].innerHTML = value[s].last.toFixed( 2 );      
      row.children[3].style.color = value[s].change > 0 ? Table.COLOR_GREEN : Table.COLOR_RED;
      row.children[4].innerHTML = value[s].change.toFixed( 2 );      
      row.children[4].style.color = value[s].change > 0 ? Table.COLOR_GREEN : Table.COLOR_RED;      
      row.children[5].innerHTML = value[s].high.toFixed( 2 );      
      row.children[6].innerHTML = value[s].low.toFixed( 2 );      

      // Add to list
      this.list.appendChild( row );
    }    
  }  

  get data() {
    let results = [];

    // Gather data from list
    for( let r = 0; r < this.list.children.length; r++ ) {
      let stock = {
        symbol: this.list.children[r].children[0].innerHTML.trim(),
        name: this.list.children[r].children[1].innerHTML.trim(),
        open: parseFloat( this.list.children[r].children[2].innerHTML ),
        last: parseFloat( this.list.children[r].children[3].innerHTML ),
        change: parseFloat( this.list.children[r].children[4].innerHTML ),
        high: parseFloat( this.list.children[r].children[5].innerHTML ),
        low: parseFloat( this.list.children[r].children[6].innerHTML )
      };
      results.push( stock );
    }

    return results;
  }
}

Table.COLOR_GREEN = '#4CAF50';
Table.COLOR_RED = '#F44336';
