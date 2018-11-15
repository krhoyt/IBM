from datetime import datetime

import config
import mysql.connector
import requests

# Check and store mentions
def mentions( values ):
  result = ''

  for people in values:
    result = result + ',' + people['screen_name']

    cursor.execute( 
      'SELECT twitter_id FROM Mention WHERE twitter_id = %s', (
        people['id_str'],
      )
    )
    found = cursor.fetchall()

    if len( found ) == 0:
      cursor.execute(
        'INSERT INTO Mention VALUES ( NULL, %s, %s, %s, NULL, NULL, NULL, 0, 0, 0, 0, 0 )', (
          people['id_str'], 
          people['screen_name'],
          people['name']
        )
      )
      connection.commit()

  return result

# Check and store media
def photos( twitter_id, created, values ):
  for link in values:
    if link['type'] == 'photo':
      cursor.execute( 
        'SELECT media_id FROM Media WHERE media_id = %s', (
          link['id_str'],
        )
      )
      found = cursor.fetchall()

      if len( found ) == 0:
        keywords = visual( link['media_url'] )

        cursor.execute(
          'INSERT INTO Media VALUES ( NULL, %s, %s, %s, %s, %s )', (
            twitter_id,
            link['id_str'], 
            created.strftime( '%Y-%m-%d %H:%M:%S' ), 
            link['media_url'],
            keywords
          )
        )
        connection.commit()

def profile( name ):
  response = requests.get(
    url = config.Twitter['timeline'],
    headers = {
      'Authorization': 'Bearer ' + config.Twitter['token']
    },
    params = {
      'screen_name': name,
      'count': 1
    }
  )
  response = response.json()

  return response['user']

def timeline( name ):
  response = requests.get(
    url = config.Twitter['timeline'],
    headers = {
      'Authorization': 'Bearer ' + config.Twitter['token']
    },
    params = {
      'screen_name': name,
      'count': config.Twitter['count']
    }
  )

  return response.json()

def visual( url ):
  result = ''

  response = requests.post( 
    config.Visual['url'] + '?version=' + config.Visual['version'], 
    auth = (
      'apikey',
      config.Visual['key']
    ),
    data = {
      'url': url
    }
  )

  data = response.json()

  for image in data['images']:
    if 'classifiers' in image:
      for classifier in image['classifiers']:
        for classify in classifier['classes']:
          result = result + ',' + classify['class']
    else:
      print( image )

  return result[1:]

# Get Twitter token
response = requests.post(
  url = config.Twitter['token'],
  auth = (
    config.Twitter['key'],
    config.Twitter['secret']
  ),
  data = {
    'grant_type': 'client_credentials',
  }
)

# Assign token to configuration
response = response.json()
config.Twitter['token'] = response['access_token']

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
  if person[6] == None:
    continue

  # Get staff timeline
  updates = timeline( person[6] )

  for status in updates:
    print( status['id_str'] )

    cursor.execute( 
      'SELECT twitter_id FROM Twitter WHERE twitter_id = %s', (
        status['id_str'],
      ) 
    )
    found = cursor.fetchall()

    if len( found ) == 0:
      created = datetime.strptime( status['created_at'], '%a %b %d %H:%M:%S +%f %Y' )

      hashtags = ''

      if len( status['entities']['hashtags'] ) > 0:
        for tag in status['entities']['hashtags']:
          hashtags = hashtags + ',' + tag['text']

      people = ''

      if len( status['entities']['user_mentions'] ) > 0:
        people = mentions( status['entities']['user_mentions'] )

      media = ''

      if 'media' in status['entities']:
        photos( status['id_str'], created, status['entities']['media'] )

      cursor.execute(
        'INSERT INTO Twitter VALUES ( NULL, %s, %s, %s, %s, %s, %s, %s, %s )', (
          person[0], 
          status['id_str'], 
          created.strftime( '%Y-%m-%d %H:%M:%S' ), 
          status['text'],
          status['retweet_count'],
          status['favorite_count'],
          None if len( hashtags ) == 0 else hashtags[1:],
          None if len( people ) == 0 else people[1:]      
        )
      )
    else:
      cursor.execute( 
        'UPDATE Twitter SET retweet = %s, favorite = %s WHERE twitter_id = %s', (
          status['retweet_count'],
          status['favorite_count'],
          status['id_str']
        )  
      )

    connection.commit()

# Close the connection
connection.close()
