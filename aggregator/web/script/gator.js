class Gator {
  constructor() {
    this.login = new Login();
    this.login.addEventListener( Login.SUBMIT, ( evt ) => this.doLoginSubmit( evt ) );
  }

  doLoginSubmit( evt ) {
    console.log( evt );
    this.login.hide();
  }
}

const app = new Gator();
