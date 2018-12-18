class Home {
  constructor() {
    this.person = null;

    this.root = document.querySelector( '#home' );
    this.icon = this.root.querySelector( 'div.photo' ); 
    this.name = this.root.querySelector( 'p' );
  }

  show() {
    this.root.style.visibility = 'visible';
    this.root.style.opacity = 1;
  }

  set advocate( value ) {
    this.person = value;
    this.icon.style.backgroundImage = `url( ${this.person.photo} )`;
    this.name.innerHTML = `${this.person.nickname ? this.person.nickname : this.person.first_name} ${this.person.last_name}`;
  }

  get advocate() {
    return this.person;
  }
}
