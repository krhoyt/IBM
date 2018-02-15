class Block {
  constructor( data, previousHash ) {
    this.nonce = null;
    this.data = data;
    this.previousHash = previousHash;
    this.timeStamp = Date.now();
    this.hash = this.calculateHash();
  }

  calculateHash() {
    let sha = new jsSHA( 'SHA-256', 'TEXT' );
    sha.update(
      this.previousHash +
      this.timeStamp +
      this.nonce + 
      this.data
    );
    return sha.getHash( 'HEX' );
  }

  mineBlock( difficulty ) {
    let target = ''.padStart( difficulty, '0' );

    while( this.hash.substring( 0, difficulty ) != target ) {
      this.nonce = this.nonce + 1;
      this.hash = this.calculateHash();
    }

    console.log( 'Block mined: ' + this.hash );
  }
}
