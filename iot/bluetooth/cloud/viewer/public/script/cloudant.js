class Cloudant {

  constructor() {
    // Not an element
    // Cannot dispatch by itself
    // Add observable
    this.listeners = new Map();

    // Connection to server
    // Feed comes to server
    // Server broadcasts
    this.socket = io();
    this.socket.on( Cloudant.BEAN_READING, evt => this.doFeed( evt ) );
  }

  // Emit
  doFeed( evt ) {
    this.emit( Cloudant.BEAN_READING, evt );
  }

  // ES6 event listener comes from Dave Atchley
  // https://gist.github.com/datchley/37353d6a2cb629687eb9  
  addEventListener( label, callback ) {
    this.listeners.has( label ) || this.listeners.set( label, [] );
    this.listeners.get( label ).push( callback );
  }

  removeListener( label, callback ) {
    let listeners = this.listeners.get( label );
    let index;
    
    if( listeners && listeners.length ) {
      index = listeners.reduce( ( i, listener, index ) => {
        return ( isFunction( listener ) && listener === callback ) ? i = index : i;
      }, -1 );
        
      if( index > -1 ) {
        listeners.splice( index, 1 );
        this.listeners.set( label, listeners );
        
        return true;
      }
    }
    
    return false;
  }

  emit( label, ...args ) {
    let listeners = this.listeners.get( label );
    
    if( listeners && listeners.length ) {
      listeners.forEach( ( listener ) => {
        listener( ...args ); 
      } );
        
      return true;
    }
    
    return false;
  }  
}

// Constants
Cloudant.BEAN_READING = 'bean';
