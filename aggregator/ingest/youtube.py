from datetime import datetime

import config
import feedparser
import mysql.connector
import requests

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
  if person[9] == None:
    continue

  response = requests.get(
    url = 'https://www.youtube.com/feeds/videos.xml',
    params = {
      'channel_id': person[9]
    }
  )
  rss = feedparser.parse( response.text )  

  for entry in rss.entries:
    print( entry['title'] )

    cursor.execute( 
      'SELECT guid FROM YouTube WHERE guid = %s', (
        entry.id,
      ) 
    )
    found = cursor.fetchall()

    if len( found ) == 0:
      created_at = datetime( *( entry.updated_parsed[0:6] ) )      
      space = entry.summary[0:255].rfind( ' ' )        

      cursor.execute(
        'INSERT INTO YouTube VALUES ( NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s )', (
          person[0], 
          entry.id, 
          created_at.strftime( '%Y-%m-%d %H:%M:%S' ), 
          entry.link,
          entry.media_statistics['views'],
          entry.media_starrating['count'],
          entry.title,
          entry.summary[0:space],
          entry.media_thumbnail[0]['url']
        )
      )      
    else:
      cursor.execute(
        'UPDATE YouTube SET views = %s, stars = %s WHERE guid = %s', (
          entry.media_statistics['views'],
          entry.media_starrating['count'],          
          entry.id, 
        )
      )

    connection.commit()
  