class Gary {
  constructor() {
    this.bounds = null;
    this.listeners = [];
    this.offset = null;
    this.touch = ( 'ontouchstart' in document.documentElement ) ? true : false;

    this.doAntsMove = this.doAntsMove.bind( this );    
    this.doAntsEnd = this.doAntsEnd.bind( this );

    this.doHandleMove = this.doHandleMove.bind( this );        
    this.doHandleEnd = this.doHandleEnd.bind( this );        

    this.root = document.createElement( 'div' );
    this.root.classList.add( 'gary' );
    document.body.appendChild( this.root );

    // Marching ants styling courtesy:
    // http://www.chrisdanford.com/blog/2014/04/28/marching-ants-animated-selection-rectangle-in-css/
    this.ants = document.createElement( 'div' );
    this.ants.classList.add( 'ants' );
    this.ants.addEventListener( 
      this.touch ? 'touchstart' : 'mousedown', 
      ( evt ) => this.doAntsStart( evt ) 
    );
    this.root.appendChild( this.ants );

    this.handles = {
      tl: null,
      tr: null,
      br: null,
      bl: null
    };

    for( let handle in this.handles ) {
      this.handles[handle] = document.createElement( 'div' );
      this.handles[handle].classList.add( 'handle', handle );
      this.handles[handle].setAttribute( 'data-handle', handle );
      this.handles[handle].addEventListener( 
        this.touch ? 'touchstart' : 'mousedown', 
        ( evt ) => this.doHandleStart( evt ) 
      );
      this.root.appendChild( this.handles[handle] );
    }
  }

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

  snapToBounds() {
    const size = this.getSize();

    this.setPosition( this.bounds.x, this.bounds.y );
    
    if( size.width > this.bounds.width ) {
      size.width = this.bounds.width;
    }

    if( size.height > this.bounds.height ) {
      size.height = this.bounds.height;
    }      

    this.setSize( size.width, size.height );
  }

  clearBounds() {
    this.bounds = null;
  }

  getBounds() {
    let result = null;

    if( this.bounds !== null ) {
      result = {
        x: this.bounds.x,
        y: this.bounds.y,
        width: this.bounds.width,
        height: this.bounds.height
     };
    }

    return result;
  }

  setBounds( x, y, width, height, snap = true ) {
    this.bounds = {
      x: x,
      y: y,
      width: width,
      height: height,
      right: x + width,
      bottom: y + height 
    };

    if( snap ) {
      this.snapToBounds();
    }    
  }

  getParent() {
    let result = null;

    if( this.bounds.element ) {
      result = this.bounds.element;
    }

    return result;
  }

  setParent( element, snap = true ) {
    this.bounds = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      right: 0,
      bottom: 0,
      element: element
    };

    if( element.length ) {
      element = document.querySelector( element );
    }

    this.bounds.width = element.clientWidth;
    this.bounds.height = element.clientHeight;

    // Calculating nested position courtesy:
    // https://www.kirupa.com/html5/get_element_position_using_javascript.htm
    while( element ) {
      if( element.tagName === 'BODY' ) {
        const xScroll = element.scrollLeft || document.documentElement.scrollLeft;
        const yScroll = element.scrollTop || document.documentElement.scrollTop;
   
        this.bounds.x += ( element.offsetLeft - xScroll + element.clientLeft );
        this.bounds.y += ( element.offsetTop - yScroll + element.clientTop );
      } else {
        this.bounds.x += ( element.offsetLeft - element.scrollLeft + element.clientLeft );
        this.bounds.y += ( element.offsetTop - element.scrollTop + element.clientTop );
      }
   
      element = element.offsetParent;
    }

    this.bounds.right = this.bounds.x + this.bounds.width;
    this.bounds.bottom = this.bounds.y + this.bounds.height;

    if( snap ) {
      this.snapToBounds();
    }
  }

  getPosition() {
    let result = {
      x: parseInt( this.root.style.left ) + ( Gary.HANDLE_DIAMETER / 2 ),
      y: parseInt( this.root.style.top ) + ( Gary.HANDLE_DIAMETER / 2 )
    };

    if( this.bounds ) {
      if( this.bounds.element ) {
        result.x = result.x - this.bounds.x;
        result.y = result.y - this.bounds.y;
      }
    }

    return result;
  }

  setPosition( x, y ) {
    let location = {
      left: x - ( Gary.HANDLE_DIAMETER / 2 ),
      top: y - ( Gary.HANDLE_DIAMETER / 2 )
    };

    if( this.bounds ) {
      if( this.bounds.element ) {
        location.left = location.left + this.bounds.x;
        location.top = location.top + this.bounds.y;
      }
    }

    this.root.style.left = location.left + 'px';
    this.root.style.top = location.top + 'px';    
  }

  getSize() {
    const computed = window.getComputedStyle( this.root, null );

    return {
      width: parseInt( computed.getPropertyValue( 'width' ) ) - Gary.HANDLE_DIAMETER,
      height: parseInt( computed.getPropertyValue( 'height' ) ) - Gary.HANDLE_DIAMETER     
    };
  }

  setSize( width, height ) {
    this.root.style.width = ( width + Gary.HANDLE_DIAMETER ) + 'px';
    this.root.style.height = ( height + Gary.HANDLE_DIAMETER ) + 'px';    
  }  

  getVisibility() {
    let result = false;

    if( this.root.style.display == 'block' ) {
      result = true;
    }

    return result;
  }

  setVisibility( visible ) {
    if( visible ) {
      this.root.style.display = 'block';
    } else {
      this.root.style.display = 'none';
    }
  }

  doAntsEnd( evt ) {
    document.removeEventListener( 
      this.touch ? 'touchmove' : 'mousemove', 
      this.doAntsMove 
    );    
    document.removeEventListener( 
      this.touch ? 'touchend' : 'mouseup', 
      this.doAntsEnd 
    );

    this.offset = null;

    this.emit( Gary.POSITION_CHANGE, this.getPosition() );
  }

  doAntsMove( evt ) {
    const size = this.getSize();    
    let position = {
      x: evt.clientX - this.offset.x,
      y: evt.clientY - this.offset.y
    };

    if( this.bounds !== null ) {
      if( position.x < this.bounds.x ) {
        position.x = this.bounds.x;
      }

      if( position.y < this.bounds.y ) {
        position.y = this.bounds.y;
      }

      if( position.x + size.width > this.bounds.right ) {
        position.x = this.bounds.right - size.width;
      }

      if( position.y + size.height > this.bounds.bottom ) {
        position.y = this.bounds.bottom - size.height;
      }      
    }

    this.setPosition( position.x, position.y );
  }

  doAntsStart( evt ) {
    this.offset = {
      x: evt.offsetX,
      y: evt.offsetY
    };

    document.addEventListener( this.touch ? 'touchmove' : 'mousemove', this.doAntsMove );
    document.addEventListener( this.touch ? 'touchend' : 'mouseup', this.doAntsEnd );
  }

  doHandleEnd( evt ) {
    document.removeEventListener( 
      this.touch ? 'touchmove' : 'mousemove', 
      this.doHandleMove 
    );    
    document.removeEventListener( 
      this.touch ? 'touchend' : 'mouseup', 
      this.doHandleEnd 
    );

    this.offset = null;

    this.emit( Gary.SIZE_CHANGE, this.getSize() );
  }

  doHandleMove( evt ) {
    console.log( evt );

    switch( this.offset.handle ) {
      case 'br':

        break;
    }
  }

  doHandleStart( evt ) {
    const position = this.getPosition();

    this.offset = {
      x: evt.offsetX,
      y: evt.offsetY,
      handle: evt.target.getAttribute( 'data-handle' )
    }

    document.addEventListener( this.touch ? 'touchmove' : 'mousemove', this.doHandleMove );
    document.addEventListener( this.touch ? 'touchend' : 'mouseup', this.doHandleEnd );    
  }
}

Gary.BORDER_WIDTH = 1;
Gary.HANDLE_DIAMETER = 10;
Gary.POSITION_CHANGE = 'gary_position_change';
Gary.SIZE_CHANGE = 'gary_size_change';
