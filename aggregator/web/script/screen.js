// Default screen
// Takes care of sizing
// Takes care of show and hide
// Takes care of event listeners
// Takes care of root element reference
class Screen {
  constructor( root ) {
    // Display keeps original style value
    // Used during transitions
    // Keep from overriding user style
    this.display = null;

    // Event listeners
    this.listeners = [];

    // Root element reference
    // Root element sizing
    this.root = root;
    this.root.style.width = window.innerWidth + 'px';
    this.root.style.height = window.innerHeight + 'px';
    this.root.style.left = window.innerWidth + 'px';    
  }

  // Event hooks
  addEventListener( label, callback ) {
    this.listeners.push( {
      label: label,
      callback: callback
    } );
  }

  emit( label, evt ) {
    for( let h = 0; h < this.listeners.length; h++ ) {
      if( this.listeners[h].label == label ) {
        this.listeners[h].callback( evt );
      }
    }
  }

  // Hide the screen
  // Can hide to the left or right
  hide( reverse = false ) {
    let offset = 0 - window.innerWidth;

    if( reverse ) {
      offset = window.innerWidth;
    }

    // TODO: Use CSS transitions
    TweenMax.to( this.root, 0.60, {
      left: offset,
      onComplete: () => {
        // Hide screen when move is done
        this.display = this.root.style.display;
        this.root.style.display = 'none';
      }
    } );
  }

  // Show screen
  // Left or right
  show( reverse = false ) {
    let offset = window.innerWidth;

    if( reverse ) {
      offset = 0 - window.innerWidth;
    }

    // Restore user-defined style
    this.root.style.left = offset + 'px';
    this.root.style.display = this.display;

    // TODO: Use CSS transitions
    TweenMax.to( this.root, 0.60, {
      left: 0
    } );
  }
}
