import csv
import requests
import time

from random import randint
from random import random

# https://github.com/datasets/s-and-p-500-companies
with open( 'short.list.csv', 'rb' ) as financials:
  reader = csv.reader( financials )
  portfolio = list( reader )

while True:
  stock = portfolio[randint( 0, len( portfolio ) - 1 )]

  if len( stock[8] ) == 0:
    continue

  last = randint( 
    int( float( stock[8] ) * 100 ), 
    int( float( stock[9] ) * 100 ) 
  )

  trade = {
    '$class': 'org.acme.market.Trade',
    'stock': stock[0],
    'price': float( last ) / 100,
  }
  requests.post( 'http://localhost:3000/api/Trade', json = trade )
  time.sleep( 1 )  
