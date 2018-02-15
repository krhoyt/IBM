class NoobChain {
  constructor() {
    this.blockchain = [];
    this.difficulty = 5;

    console.log( 'Trying to mine Block #1 ...' );    
    this.addBlock( new Block( 
      'Hi! I am the first block.', 
      0 
    ) );

    console.log( 'Trying to mine Block #2 ...' );    
		this.addBlock( new Block( 
      'Yo! I am the second block.', 
      this.blockchain[this.blockchain.length - 1].hash 
    ) );    

    console.log( 'Trying to mine Block #3 ...' );    
		this.addBlock( new Block( 
      'Hey! I am the third block.', 
      this.blockchain[this.blockchain.length - 1].hash 
    ) );    

    console.log( 'Blockchain is valid: ' + this.isChainValid() );
    console.log( this.blockchain );
  }

  addBlock( newBlock ) {
    newBlock.mineBlock( this.difficulty );
    this.blockchain.push( newBlock );
  }

  isChainValid() {
    for( let i = 1; i < this.blockchain.length; i++ ) {
      let hashTarget = ''.padStart( this.difficulty, '0' );
			let currentBlock = this.blockchain[i];
			let previousBlock = this.blockchain[i - 1];

			if( currentBlock.hash != currentBlock.calculateHash() ) {
        console.log( 'Current hashes are not equal.' );
        return false;
      }
      
			if( previousBlock.hash != currentBlock.previousHash ) {
        console.log( 'Previous hashes are not equal.' );
				return false;
			}
      
			if( currentBlock.hash.substring( 0, this.difficulty ) != hashTarget ) {
        console.log( 'This block has not been mined.' );
				return false;
			}			
    }
    
    return true;
  }
}

let app = new NoobChain();
