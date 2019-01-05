class Organization extends Observer {
  constructor() {
    super();
    
    this.root = document.querySelector( 'gator-organization' );
    this.root.setAttribute( 'data-display', 'none' ); 

    this.selected = document.createElement( 'div' );
    this.root.appendChild( this.selected );    
  }

  build( data ) {
    let name = document.createElement( 'p' );    
    name.innerHTML = data[0].organization;    
    name.addEventListener( 'click', ( evt ) => this.doOrganizationClick( evt ) );
    this.root.insertBefore( name, this.selected );

    let team = null;

    for( let d = 0; d < data.length; d++ ) {
      if( data[d].team_id != team ) {
        team = data[d].team_id;

        let button = document.createElement( 'button' );
        button.classList.add( 'team' );
        button.setAttribute( 'data-team', data[d].team_id );
        button.setAttribute( 'data-name', data[d].team_name );
        button.addEventListener( 'click', ( evt ) => this.doItemClick( evt ) );                                       

        let icon = document.createElement( 'div' );
        icon.style.backgroundImage = `url( img/${data[d].team_name.toLowerCase()}.svg )`;
        button.appendChild( icon );

        let label = document.createElement( 'p' );
        label.innerHTML = data[d].team_name;
        button.appendChild( label );          

        this.root.insertBefore( button, this.selected );
      }

      let button = document.createElement( 'button' );
      button.classList.add( 'advocate' );
      button.setAttribute( 'data-advocate', data[d].advocate_id );        
      button.setAttribute( 'data-email', data[d].email );                
      button.setAttribute( 'data-first', data[d].first );        
      button.setAttribute( 'data-last', data[d].last );                
      button.setAttribute( 'data-latitude', data[d].latitude );                
      button.setAttribute( 'data-longitude', data[d].longitude );                        
      button.setAttribute( 'data-nickname', data[d].nickname );                                
      button.setAttribute( 'data-photo', data[d].photo );             
      button.addEventListener( 'click', ( evt ) => this.doItemClick( evt ) );                   

      let icon = document.createElement( 'div' );

      if( data[d].photo == null ) {
        icon.innerHTML = `${data[d].first.charAt( 0 )}${data[d].last.charAt( 0 )}`;
      } else {
        icon.style.backgroundImage = `url( ${data[d].photo} )`;
      }

      button.appendChild( icon );

      let label = document.createElement( 'p' );

      if( data[d].nickname == null ) {
        label.innerHTML = `${data[d].first} ${data[d].last}`;          
      } else {
        label.innerHTML = `${data[d].nickname} ${data[d].last}`;          
      }

      button.appendChild( label );

      this.root.insertBefore( button, this.selected );              
    }

    this.emit( Organization.LOAD, null );
  }

  clear() {
    this.selected.style.display = 'none';

    while( this.root.children.length > 1 ) {
      this.root.children[0].remove();      
    }
  }

  load() {
    this.clear();

    fetch( Organization.GET_ORGANIZATION )
    .then( ( response ) => response.json() )
    .then( ( data ) => this.build( data ) );
  }

  getSelectedIndex() {
    let index = 0;

    for( let c = 0; c < this.root.children.length; c++ ) {
      if( this.root.children[c].classList.contains( 'selected' ) ) {
        index = c;
        break;
      }
    }    

    return c;
  }

  setSelectedIndex( index ) {
    for( let c = 0; c < this.root.children.length; c++ ) {
      if( this.root.children[c].classList.contains( 'selected' ) ) {
        this.root.children[c].classList.remove( 'selected' );
        break;
      }
    }
    
    this.root.children[index + 1].classList.add( 'selected' );

    this.selected.style.top = `${this.root.children[index + 1].offsetTop}px`;
    this.selected.style.display = 'block';    
  }

  getSelectedItem() {
    let item = null;    

    for( let c = 0; c < this.root.children.length; c++ ) {
      if( this.root.children[c].classList.contains( 'selected' ) ) {
        if( this.root.children[c].classList.contains( 'team' ) ) {
          item = {
            id: this.root.children[c].getAttribute( 'data-team' ),
            name: this.root.children[c].getAttribute( 'data-name' )
          };
        } else if( this.root.children[c].classList.contains( 'advocate' ) ) {
          item = {
            id: this.root.children[c].getAttribute( 'data-advocate' ),
            email: this.root.children[c].getAttribute( 'data-email' ),
            first: this.root.children[c].getAttribute( 'data-first' ),
            last: this.root.children[c].getAttribute( 'data-last' ),
            latitude: parseFloat( this.root.children[c].getAttribute( 'data-latitude' ) ),
            longitude: parseFloat( this.root.children[c].getAttribute( 'data-longitude' ) ),
            nickname: this.root.children[c].getAttribute( 'data-nickname' ),
            photo: this.root.children[c].getAttribute( 'data-photo' )
          };
        }

        break;
      }
    }    

    return item;
  }

  setSelectedItem( value ) {
    let index = -1;

    for( let c = 0; c < this.root.children.length; c++ ) {
      if( this.root.children[c].classList.contains( 'team' ) ) {
        if( this.root.children[c].getAttribute( 'data-team' ) == value.id ) {
          index = c;
        }
      }
      
      if( this.root.children[c].classList.contains( 'advocate' ) ) {
        if( this.root.children[c].getAttribute( 'data-advocate' ) == value.id ) {
          index = c;
        }
      }

      if( index >= 0 ) {
        this.setSelectedIndex( index );
        break;
      }
    }    
  }

  doItemClick( evt ) {
    let item = evt.target;

    if( evt.target.tagName != 'BUTTON' ) {
      item = evt.target.parentElement;
    }

    for( let c = 0; c < this.root.children.length; c++ ) {
      if( this.root.children[c].classList.contains( 'selected' ) ) {
        this.root.children[c].classList.remove( 'selected' );
        break;
      }
    }

    this.selected.style.top = `${item.offsetTop}px`;
    item.classList.add( 'selected' );    

    this.emit( 
      Organization.CHANGE, 
      this.getSelectedItem() 
    );
  }  

  doOrganizationClick( evt ) {
    // TODO: Advocate selected when closing
    // TODO: Move to next closest team item

    if( evt.altKey == true ) {
      let display = this.root.getAttribute( 'data-display' );

      if( display == 'none' ) {
        this.root.setAttribute( 'data-display', 'flex' );        
        display = 'flex';
      } else {
        this.root.setAttribute( 'data-display', 'none' );
        display = 'none';
      }

      let advocates = this.root.querySelectorAll( 'button.advocate' );

      for( let a = 0; a < advocates.length; a++ ) {
        advocates[a].style.display = display;
      }

      // TODO: Reposition selector when closed
      // TODO: Scroll top of selected item
    }
  }
}

Organization.CHANGE = 'organization_change';
Organization.GET_ORGANIZATION = 'https://openwhisk.ng.bluemix.net/api/v1/web/krhoyt%40us.ibm.com_dev/gator/get.organization';
Organization.LOAD = 'organization_load';
