from datetime import datetime

import config
import feedparser
import mysql.connector
import re
import requests

def clean( text ):
  expression = re.compile( '<.*?>' )
  cleaned = re.sub( expression, '', text )

  return cleaned

def nlu( url ):
  response = requests.get(
    url = config.NLU['url'],
    auth = (
      config.NLU['key'],
      config.NLU['secret']
    ),
    params = {
      'url': url,
      'version': config.NLU['version'],
      'features': 'concepts,keywords,entities'
    }
  ) 

  data = response.json()

  result = {
    'keywords': [],
    'concepts': [],
    'entities': []
  }

  if 'keywords' in data:
    result = {
      'keywords': reduce( data['keywords'] ),
      'concepts': reduce( data['concepts'] ),
      'entities': reduce( data['entities'] )
    }

  return result

def reduce( values ):
  combined = []
  unique = []

  for key in values:
    if key['relevance'] < 0.50:
      continue

    if key['text'].find( ' ' ) > -1:
      parts = key['text'].split( ' ' )

      for part in parts:
        combined.append( part.strip().lower() )

  for word in combined:
    found = False

    for item in unique:
      if item == word:
        found = True
        break

    if found == False:
      unique.append( word )

  csv = ''

  for word in unique:
    csv = csv + ',' + word

  csv = csv[1:]

  if len( csv ) > 255:
    csv = csv[0:255]
    index = csv.rfind( ',' )
    csv = csv[0:index]

  return csv  

# Connect to Compose MySQL
connection = mysql.connector.connect(
  user = config.MySQL['user'],
  password = config.MySQL['password'],
  host = config.MySQL['host'],
  port = config.MySQL['port'],
  database = config.MySQL['database'],
  ssl_ca = config.MySQL['certificate']
)

# Get the staff list
cursor = connection.cursor()  
cursor.execute( 'SELECT * FROM Staff' )
staff = cursor.fetchall()

for person in staff:
  if person[8] == None:
    continue

  response = requests.get( person[8] )
  rss = feedparser.parse( response.text )  

  for entry in rss.entries:
    print( entry['title'] )

    cursor.execute( 
      'SELECT guid FROM Blog WHERE guid = %s', (
        entry.id,
      ) 
    )
    found = cursor.fetchall()

    if len( found ) == 0:
      if hasattr( entry, 'created_parsed' ):
        created_at = datetime( *( entry.created_parsed[0:6] ) )    
      else:
        created_at = datetime( *( entry.updated_parsed[0:6] ) )    
    
      tags = ''

      if hasattr( entry, 'tags' ):
        for tag in entry.tags:
          tags = tags + ',' + tag.term

      entry.summary = clean( entry.summary )
      space = entry.summary[0:255].rfind( ' ' )

      language = nlu( entry.link )

      cursor.execute(
        'INSERT INTO Blog VALUES ( NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s )', (
          person[0], 
          entry.id, 
          created_at.strftime( '%Y-%m-%d %H:%M:%S' ), 
          entry.link,
          entry.title,
          entry.summary[0:space],
          None if len( tags ) == 0 else tags[1:],
          None if len( language['keywords'] ) == 0 else language['keywords'],
          None if len( language['concepts'] ) == 0 else language['concepts'],
          None if len( language['entities'] ) == 0 else language['entities']
        )
      )      

      connection.commit()
