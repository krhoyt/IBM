class Objects extends Observer {
  constructor() {
    super();

    // Root
    this.root = document.querySelector( '#objects' );

    // Back
    this.back = this.root.querySelector( '.header > button:first-of-type' );
    this.back.addEventListener( 'touchstart', ( evt ) => this.doBackTouch( evt ) );
    this.back.innerHTML = '';    

    // Title
    this.title = this.root.querySelector( '.header > p' );

    // Add
    this.add = this.root.querySelector( '.header > button:last-of-type' );
    this.add.addEventListener( 'click', ( evt ) => this.doAddTouch( evt ) );
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

  hide() {
    // Screen will be opaque
    // Make transparent
    // Screen will be on screen
    // Animation off right side of screen
    // Inline with iOS behaviors
    this.root.style.opacity = 0;    
    this.root.style.left = Math.round( window.innerWidth * 0.25 ) + 'px';

    // Hide screen when animation is complete
    // Clear the list for reuse
    setTimeout( () => {
      this.root.style.visibility = 'hidden';
      this.clear();
    }, 1000 * Objects.ANIMATION_DURATION );
  }

  // Remove an element by attribute name
  remove( name ) {
    let element = this.root.querySelector( `div[data-name="${name}"]` );
    element.remove();    
  }

  show() {
    // Screen will be hidden
    // Make screen visible
    // Screen will be transparent
    // Make screen opaque
    // Screen will be shifted off the right
    // Move to zero
    this.root.style.visibility = 'visible';
    this.root.style.opacity = 1;    
    this.root.style.left = 0;
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
        modified: this.list.children[c].getAttribute( 'data-modified' ),
        name: this.list.children[c].getAttribute( 'data-name' ),
        size: this.list.children[c].getAttribute( 'data-size' ),        
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

      // Remove template styling
      item.classList.remove( 'template' );

      // Store original data values
      item.setAttribute( 'data-modified', data[d].modified );      
      item.setAttribute( 'data-name', data[d].name );
      item.setAttribute( 'data-size', data[d].size );
      item.setAttribute( 'data-type', data[d].type );
      
      // Formatting of creation date
      const parsed = new Date( data[d].modified );
      const created = moment( parsed );
      const dated = created.format( 'MMM D, YYYY' );
      const timed = created.format( 'h:mm A' );      
      const sized = Storage.formatBytes( parseInt( data[d].size ) );
      
      // Populate item
      item.children[1].children[0].innerHTML = data[d].name;      
      item.children[1].children[1].innerHTML = `${sized} &bull; ${dated} at ${timed}`;
      item.children[2].addEventListener( 'touchstart', ( evt ) => this.doMoreTouch( evt ) );
  
      // Put item into list
      // Before the template item
      this.list.insertBefore( item, template );
    }    
  }

  getTitle() {
    return this.title.getAttribute( 'data-bucket' );
  }

  setTitle( bucket ) {
    // Store bucket name 
    // Display bucket name
    // Also available on bucket instance as name property
    this.title.setAttribute( 'data-bucket', bucket );
    this.title.innerHTML = bucket;
  }

  // Add an object (upload)
  doAddTouch( evt ) {
    this.emit( Objects.EVENT_ADD, null );
  }

  // Dismiss screen
  doBackTouch( evt ) {
    this.emit( Objects.EVENT_BACK, null );
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

      // Get name value for matching
      // Not case-sensitive
      // Force lowercase
      let name = this.list.children[c].getAttribute( 'data-name' ).toLowerCase();

      // Pattern provided
      if( pattern.length == 0 ) {
        this.list.children[c].style.display = 'flex';
      }

      // Pattern not in bucket name
      if( name.indexOf( pattern ) == -1 ) {
        this.list.children[c].style.display = 'none';
      } else {
        // Pattern in bucket name
        this.list.children[c].style.display = 'flex';
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

    // Send along the pertinent object
    this.emit( Objects.EVENT_MORE, {
      modified: new Date( target.getAttribute( 'data-modified' ) ),
      name: target.getAttribute( 'data-name' ),
      size: target.getAttribute( 'data-size' ),
      type: target.getAttribute( 'data-type' )
    } );    
  }
}

// Constants
Objects.ANIMATION_DURATION = 0.60;
Objects.EVENT_ADD = 'objects_event_add';
Objects.EVENT_BACK = 'objects_event_back';
Objects.EVENT_MORE = 'objects_event_more';
