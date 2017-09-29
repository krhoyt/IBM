/**
 * Change stock values as transaction to get event notification.
 * @param {org.acme.market.Trade} tx Transaction instance.
 * @transaction
 */
function trade( tx ) {
  tx.stock.low = Math.min( tx.price, tx.stock.low );
  tx.stock.high = Math.max( tx.price, tx.stock.high );  
  tx.stock.change = Math.round( ( tx.price - tx.stock.last ) * 100 ) / 100;
  tx.stock.last = tx.price;
  
  // Get the asset registry
  return getAssetRegistry( 'org.acme.market.Stock' )
    .then( function( registry ) {
      // Update the asset
      return registry.update( tx.stock );
    } )
	.then( function() {
    // Generate event
    var event = getFactory().newEvent( 
      'org.acme.market', 
      'TradeComplete' 
    );
  
    // Set properties
    event.symbol = tx.stock.symbol;
    event.low = tx.stock.low;
    event.high = tx.stock.high;
    event.open = tx.stock.open;
    event.last = tx.stock.last;
    event.change = tx.stock.change;
  
    // Emit
    emit( event );
  } );
}  

/**
 * Change stock values as transaction to get event notification.
 * @param {org.acme.market.Basket} tx Transaction instance.
 * @transaction
 */
function basket( tx ) {  
  for( var s = 0; s < tx.lot.length; s++ ) {
    tx.lot[s].low = Math.min( tx.prices[s], tx.lot[s].low );
    tx.lot[s].high = Math.max( tx.prices[s], tx.lot[s].high );    
	  tx.lot[s].change = Math.round( ( tx.prices[s] - tx.lot[s].last ) * 100 ) / 100;
  	tx.lot[s].last = tx.prices[s];
  }
  
  return getAssetRegistry( 'org.acme.market.Stock' )
    .then( function( registry ) {
      // Update the assets
      return registry.updateAll( tx.lot );
    } )
  	.then( function() {
      // Generate event
      var event = getFactory().newEvent( 
        'org.acme.market', 
        'BasketComplete' 
      );
    
      // Stocks with applied changes
      event.lot = tx.lot;
    
      // Emit
      emit( event );
    } );
}
