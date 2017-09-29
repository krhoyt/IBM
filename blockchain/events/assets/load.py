import csv
import requests

from random import randint
from random import random

# https://github.com/datasets/s-and-p-500-companies
with open( 'short.list.csv', 'rb' ) as financials:
  reader = csv.reader( financials )
  portfolio = list( reader )

for stock in portfolio:
  last = randint( 
    int( float( stock[8] ) * 100 ), 
    int( float( stock[9] ) * 100 ) 
  )
  
  row = {
    '$class': 'org.acme.market.Stock',
    'symbol': stock[0],
    'name': stock[1],
    'low': float( stock[8] ),
    'high': float( stock[9] ),
    'open': float( stock[8] ),
    'last': float( last ) / 100,
    'change': 0.01 if random() > 0.50 else -0.01
  }
  requests.post( 'http://localhost:3000/api/Stock', json = row )
