class Login extends Observer {
  constructor() {
    super();

    this.root = document.querySelector( '#login' );
    this.root.style.height = window.innerHeight + 'px';

    this.email = this.root.querySelector( 'input:first-of-type' );
    this.email.addEventListener( 'keypress', ( evt ) => this.doKeyboard( evt ) );

    this.password = this.root.querySelector( 'input:last-of-type' );
    this.password.addEventListener( 'keypress', ( evt ) => this.doKeyboard( evt ) );    

    this.submit = this.root.querySelector( 'button.login' );
    this.submit.addEventListener( 'touchstart', ( evt ) => this.doSubmitClick( evt ) );
  }

  hide() {
    this.root.style.top = this.root.style.height;
    this.root.style.opacity = 0;
  }

  validate() {
    if( this.email.value.trim().length == 0 ) {
      alert( 'Email address is required.');
      return;
    }

    if( this.password.value.trim().length == 0 ) {
      alert( 'Password is required.');
      return;
    }    

    this.emit( Login.SUBMIT, {
      email: this.email.value.trim(),
      password: this.password.value.trim()
    } );
  }

  doKeyboard( evt ) {
    if( evt.keyCode == 13 ) {
      evt.target.blur();
      this.validate();
    }
  }

  doSubmitClick( evt ) {
    this.validate();
  }
}

Login.SUBMIT = 'login_submit';
