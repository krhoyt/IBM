class Gator {
  constructor() {
    this.summary = null;

    this.login = new Login();
    this.login.addEventListener( Login.SUBMIT, ( evt ) => this.doLoginSubmit( evt ) );

    this.home = new Home();
  }

  doLoginSubmit( evt ) {
    fetch( `${Gator.LOGIN}?email=${evt.email}` )
    .then( ( response ) => {return response.json();} )
    .then( ( data ) => {
      console.log( data );

      if( data.id ) {
        this.login.hide();
        this.home.advocate = data;
      } else {
        alert( 'Advocate not found.' );
      }

      return fetch( `${Gator.SUMMARY}?id=${data.id}` );
    } )
    .then( ( response ) => {return response.json();} )
    .then( ( data ) => {
      console.log( data );
      
      if( data.id ) {
        this.summary = data;
        this.home.show();
      } else {
        alert( 'Invalid advocate ID.' );
      }
    } );
  }
}

Gator.LOGIN = 'https://openwhisk.ng.bluemix.net/api/v1/web/krhoyt%40us.ibm.com_dev/gator/get.advocate.profile';
Gator.SUMMARY = 'https://openwhisk.ng.bluemix.net/api/v1/web/krhoyt%40us.ibm.com_dev/gator/get.advocate.summary';

const app = new Gator();
