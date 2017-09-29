import requests
import time

from random import randint
from random import random

response = requests.get( 'http://localhost:3000/api/Stock' )
portfolio = response.json()

while True:
  count = randint( 1, len( portfolio ) )
  lot = []
  prices = []

  while count > 0:
    stock = portfolio[randint( 0, len( portfolio ) - 1 )]
    last = randint( 
      int( float( stock['low'] ) * 100 ), 
      int( float( stock['high'] ) * 100 ) 
    )

    lot.append( stock['symbol'] )
    prices.append( float( last ) / 100 )

    count = count - 1

  basket = {
    '$class': 'org.acme.market.Basket',
    'lot': lot,
    'prices': prices
  }
  requests.post( 'http://localhost:3000/api/Basket', json = basket )
  time.sleep( 1 )  
