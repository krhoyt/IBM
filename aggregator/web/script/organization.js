class Organization extends Observer {
  constructor() {
    // Inherit
    super();

    // Elements
    this.root = document.querySelector( 'nav' );    
    this.selected = this.root.querySelector( 'div.selected' );

    // Load
    fetch( Organization.GET_ORGANIZATION )
    .then( ( response ) => response.json() )
    .then( ( data ) => {
      let team = null;

      for( let d = 0; d < data.length; d++ ) {
        // Team
        if( team != data[d].team_id ) {
          // Flag
          team = data[d].team_id;

          // Button
          let button = document.createElement( 'button' );
          button.classList.add( 'team' );
          button.setAttribute( 'data-team', data[d].team_id );
          button.addEventListener( 'click', ( evt ) => this.doItemClick( evt ) );                             

          // Icon
          let icon = document.createElement( 'div' );
          icon.style.backgroundImage = `url( img/${data[d].team_name.toLowerCase()}.svg )`;
          button.appendChild( icon );

          // Label
          let label = document.createElement( 'p' );
          label.innerHTML = data[d].team_name;
          button.appendChild( label );

          // Append
          this.root.appendChild( button );
        }

        // Advocate
        // Button
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

        // Icon
        let icon = document.createElement( 'div' );

        if( data[d].photo == null ) {
          icon.innerHTML = `${data[d].first.charAt( 0 )}${data[d].last.charAt( 0 )}`;
        } else {
          icon.style.backgroundImage = `url( ${data[d].photo} )`;
        }

        button.appendChild( icon );

        // Label
        let label = document.createElement( 'p' );

        if( data[d].nickname == null ) {
          label.innerHTML = `${data[d].first} ${data[d].last}`;          
        } else {
          label.innerHTML = `${data[d].nickname} ${data[d].last}`;          
        }

        button.appendChild( label );

        // Append
        this.root.appendChild( button );        
      }
      
      console.log( data );
    } );
  }

  doItemClick( evt ) {
    let item = evt.target;

    // Button or child
    if( evt.target.tagName != 'BUTTON' ) {
      item = evt.target.parentElement;
    }

    // Move
    this.selected.style.top = `${item.offsetTop}px`;

    // Events
    if( item.classList.contains( 'team' ) ) {
      this.emit( Organization.TEAM_CLICK, {
        id: item.getAttribute( 'data-team' )
      } );
    } else {
      this.emit( Organization.ADVOCATE_CLICK, {
        id: item.getAttribute( 'data-advocate' )
      } );
    }
  }  
}

// Constants
Organization.ADVOCATE_CLICK = 'organization_advocate_click';
Organization.GET_ORGANIZATION = 'https://openwhisk.ng.bluemix.net/api/v1/web/krhoyt%40us.ibm.com_dev/gator/get.organization';
Organization.TEAM_CLICK = 'organization_team_click';
