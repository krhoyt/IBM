class Greetings {
  
  constructor() {
    this.prefix = document.querySelector( '#prefix' );
    this.name = document.querySelector( '#name' );
    this.output = document.querySelector( '#output' );

    this.xhr = null;

    let button = document.querySelector( 'button' );
    button.addEventListener( 'click', evt => this.doClickSet( evt ) );

    this.read();
  }

  read() {
    this.xhr = new XMLHttpRequest();
    this.xhr.addEventListener( 'load', evt => this.doLoadRead( evt ) );
    this.xhr.open( 'GET', Greetings.URL_QUERY );
    this.xhr.send( null );
  }

  write( prefix, name ) {
    this.xhr = new XMLHttpRequest();
    this.xhr.addEventListener( 'load', evt => this.doLoadWrite( evt ) );
    this.xhr.open( 'POST', Greetings.URL_INVOKE );
    this.xhr.setRequestHeader( 'Content-Type', 'application/json' );
    this.xhr.send( JSON.stringify( {
      greeting: {
        Prefix: prefix, 
        Name: name
      }
    } ) );
  }

  doClickSet( evt ) {
    this.write( 
      this.prefix.value.trim(),
      this.name.value.trim()
    );
  }

  doLoadRead( evt ) {
    var data = JSON.parse( this.xhr.responseText );

    console.log( data );

    this.output.innerHTML = data.Prefix + ' ' + data.Name + '!';

    this.xhr.removeEventListener( 'load', this.doLoad );
    this.xhr = null;

    for( let o = 0; o < this.prefix.options.length; o++ ) {
      if( this.prefix.options[o].value == data.Prefix ) {
        this.prefix.options[o].selected = true;
        break;
      }
    }

    this.name.value = data.Name;
  }

  doLoadWrite( evt ) {
    var data = JSON.parse( this.xhr.responseText );

    console.log( data );
    console.log( data.result.status );

    this.xhr.removeEventListener( 'load', this.doLoad );
    this.xhr = null;

    setTimeout( function() {
      this.read();
    }.bind( this ), 800 );
  }  

}

Greetings.URL_QUERY = 'https://openwhisk.ng.bluemix.net/api/v1/experimental/web/krhoyt@us.ibm.com_dev/blockchain/greeting.query.json/body';
Greetings.URL_INVOKE = 'https://openwhisk.ng.bluemix.net/api/v1/experimental/web/krhoyt@us.ibm.com_dev/blockchain/greeting.invoke.json/body'

let app = new Greetings();
