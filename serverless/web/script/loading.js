class Loading {
  constructor() {
    this.root = document.querySelector( '#loading' );
  }

  hide() {
    this.root.style.display = 'none';
  }

  show() {
    this.root.style.display = 'block';
  }
}
