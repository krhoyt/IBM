class Buckets extends Observer {
  constructor() {
    super();

    // Track bucket
    this.name = null;

    // Regions to include
    // NULL shows all
    this.region = null;

    // Screen
    this.root = document.querySelector( '#buckets' );

    // Add
    this.add = this.root.querySelector( '.header > button:last-of-type' );
    this.add.addEventListener( 'touchstart', ( evt ) => this.doAddTouch( evt ) );
    this.add.innerHTML = '';

    // Filter
    this.filter = this.root.querySelector( '.filter' );
    this.filter.addEventListener( 'keyup', ( evt ) => this.doFilterKey( evt ) );

    // List
    this.list = this.root.querySelector( '.list' );
  }

  clear() {
    // Filter
    this.filter.value = '';

    // List
    while( this.list.children.length > 1 ) {
      this.list.children[0].remove();
    }
  }

  exists( name ) {
    let result = false;

    // Look for elements with matching name
    let matches = this.list.querySelectorAll( `div[data-name="${name}"]` );

    // Match found
    if( matches.length > 0 ) {
      result = true;
    }

    return result;
  }

  hide() {
    // Move and fade screen
    this.root.style.left = ( 0 - Math.round( window.innerWidth * 0.25 ) ) + 'px';
    this.root.style.opacity = 0;

    // Hide when animation is complete
    setTimeout( () => {
      this.root.style.visibility = 'visible';
    }, 1000 * Buckets.ANIMATION_DURATION );
  }

  // Remove an element by attribute name
  remove( name ) {
    let element = this.root.querySelector( `div[data-name="${name}"]` );
    element.remove();    
  }

  show() {
    // Show screen
    // Will be slightly off the left
    // Will be transparent
    // Move to on-screen (left, zero)
    // Make opaque
    this.root.style.visibility = 'visible';    
    this.root.style.left = 0;
    this.root.style.opacity = 1;
  }  

  getData() {
    let result = [];

    // Iterate items in list
    for( let c = 0; c < this.list.children.length; c++ ) {
      // Not the template
      if( this.list.children[c].classList.contains( 'template' ) ) {
        continue;
      }

      // Get pertinent attributes
      // Push into results
      result.push( {
        created_at: this.list.children[c].getAttribute( 'data-created' ),
        location: this.list.children[c].getAttribute( 'data-location' ),
        name: this.list.children[c].getAttribute( 'data-name' ),
        type: this.list.children[c].getAttribute( 'data-type' )            
      } );
    }

    return result;
  }

  setData( data ) {
    // Item template
    let template = this.list.querySelector( '.template' );

    // Iterate data points
    for( let d = 0; d < data.length; d++ ) {
      // Clone template node
      let item = template.cloneNode( true );

      // Hide if not in region
      if( data[d].location.indexOf( this.region ) == -1 ) {
        item.style.display = 'none';
      }

      // Remove template styling
      item.classList.remove( 'template' );

      // Store original data values
      item.setAttribute( 'data-created', data[d].created_at );      
      item.setAttribute( 'data-location', data[d].location );      
      item.setAttribute( 'data-name', data[d].name );
      item.setAttribute( 'data-type', data[d].type );

      // Touch will not allow scrolling
      item.addEventListener( 'click', ( evt ) => this.doItemClick( evt ) );
      
      // Formatting of creation date
      const parsed = new Date( data[d].created_at );
      const created = moment( parsed );
      const dated = created.format( 'MMM D, YYYY' );
      const timed = created.format( 'h:mm A' );      
      
      // Populate item
      item.children[1].children[0].innerHTML = data[d].name;      
      item.children[1].children[1].innerHTML = `${dated} at ${timed}`;
      item.children[2].addEventListener( 'touchstart', ( evt ) => this.doMoreTouch( evt ) );      
  
      // Put item into list
      // Before the template item
      this.list.insertBefore( item, template );
    }
  }

  // Add a bucket
  doAddTouch( evt ) {
    this.emit( Buckets.EVENT_ADD, null );
  }

  doItemClick( evt ) {
    let target = evt.target;

    // Events can happen on children
    // Get the item element specifically
    while( target.parentElement != this.list ) {
      target = target.parentElement;
    }

    // Emit event with bucket name
    this.emit( Buckets.EVENT_ITEM, {
      name: target.getAttribute( 'data-name' )
    } );
  }

  doFilterKey( evt ) {
    // Get pattern
    // Not case-sensitive
    // Force lowercase    
    let pattern = this.filter.value.toLowerCase().trim();

    // Look at the items in the list
    for( let c = 0; c < this.list.children.length; c++ ) {
      // Not the template item
      if( this.list.children[c].classList.contains( 'template' ) ) {
        continue;
      }

      // Get pertinent values for matching
      // Not case-sensitive
      // Force lowercase
      let name = this.list.children[c].getAttribute( 'data-name' ).toLowerCase();
      let location = this.list.children[c].getAttribute( 'data-location' );

      // Pattern provided
      if( pattern.length == 0 ) {
        // In region
        if( location.indexOf( this.region ) >= 0 ) {
          this.list.children[c].style.display = 'flex';
        }
      }

      // Pattern not in bucket name
      if( name.indexOf( pattern ) == -1 ) {
        this.list.children[c].style.display = 'none';
      } else {
        // Pattern in bucket name
        // In region
        if( location.indexOf( this.region ) >= 0 ) {
          this.list.children[c].style.display = 'flex';
        }
      }
    }        
  }  

  doMoreTouch( evt ) {
    let target = evt.target;

    // Events can happen on children
    // Get the item element specifically
    while( target.parentElement != this.list ) {
      target = target.parentElement;
    }

    // Send along the pertinent details
    this.emit( Buckets.EVENT_MORE, {
      created: new Date( target.getAttribute( 'data-created' ) ),
      name: target.getAttribute( 'data-name' ),
      type: target.getAttribute( 'data-type' )
    } );    
  }  
}

// Constants
Buckets.ANIMATION_DURATION = 0.60;
Buckets.EVENT_ADD = 'buckets_event_add';
Buckets.EVENT_ITEM = 'buckets_event_item';
Buckets.EVENT_MORE = 'buckets_event_more';
