from datetime import datetime

import config
import mysql.connector
import os
import requests
import time

# Connect to Compose MySQL
connection = mysql.connector.connect(
  user = config.MySQL['user'],
  password = config.MySQL['password'],
  host = config.MySQL['host'],
  port = config.MySQL['port'],
  database = config.MySQL['database'],
  ssl_ca = config.MySQL['certificate'],
  ssl_verify_cert = True,
  collation = 'utf8mb4_unicode_520_ci',
  autocommit = True
)

# Get the account list
cursor = connection.cursor( dictionary = True )  
cursor.execute( 'SELECT * FROM Meetup' )
groups = cursor.fetchall()

for meetup in groups:
  response = requests.get(
    url = 'https://api.meetup.com/{}/events'.format( meetup['url_name'] ),
    params = {
      'sign': True,
      'key': config.Meetup['key'],
      'page': 20,
      'desc': True,
      'status': 'upcoming,past'
    }
  )
  items = response.json()

  # Marker for updating statistics
  owner = False

  for event in items:
    # Debug
    if int( os.environ['DEBUG_OUTPUT'] ) == 1:
      print( event['name'] )

    # Record to be inserted
    record = {
      'id': None,
      'meetup_id': meetup['id'],
      'created_at': datetime.now(),
      'updated_at': datetime.now(),
      'event_id': event['id'],
      'listed_at': datetime.fromtimestamp( event['created'] / 1000 ),
      'starts_at': datetime.fromtimestamp( event['time'] / 1000 ),
      'name': event['name'],
      'maximum': event['rsvp_limit'] if 'rsvp_limit' in event else 0,
      'rsvp': event['yes_rsvp_count'],
      'waitlist': event['waitlist_count'],
      'link': event['link'],
      'description': event['description']
    }    

    # Get owner details on first record
    if owner == False:
      # Check if meetup needs updating
      # To reflect statistics
      if ( datetime.now() - meetup['updated_at'] ).days >= 7:
        response = requests.get(
          url = 'https://api.meetup.com/{0}'.format( meetup['url_name'] ),
          params = {
            'sign': True,
            'key': config.Meetup['key']
          }
        )
        item = response.json()        

        cursor.execute(
          'UPDATE Meetup SET updated_at = %s, name = %s, url_name = %s, link = %s, members = %s, description = %s, city = %s, latitude = %s, longitude = %s WHERE id = %s', (
            datetime.now().strftime( '%Y-%m-%d %H:%M:%S' ),
            item['name'],
            item['urlname'],
            item['link'],            
            item['members'],
            item['description'],
            item['city'],
            item['lat'],
            item['lon'],
            meetup['id']
          )
        )

        # Mark as updated
        # Avoid updating for each answer item
        owner = True

    # Check if event already captured
    cursor.execute( 
      'SELECT meetup_id FROM Event WHERE event_id = %s', (
        record['event_id'],
      ) 
    )
    found = cursor.fetchall()

    if len( found ) == 0:
      cursor.execute(
        'INSERT INTO Event VALUES ( NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s )', (
          record['meetup_id'],
          record['created_at'].strftime( '%Y-%m-%d %H:%M:%S' ),
          record['updated_at'].strftime( '%Y-%m-%d %H:%M:%S' ),
          record['event_id'],
          record['listed_at'].strftime( '%Y-%m-%d %H:%M:%S' ),
          record['starts_at'].strftime( '%Y-%m-%d %H:%M:%S' ),
          record['name'],
          record['maximum'],
          record['rsvp'],
          record['waitlist'],
          record['link'],
          record['description']
        )
      )      
    else:
      cursor.execute(
        'UPDATE Event SET updated_at = %s, starts_at = %s, name = %s, maximum = %s, rsvp = %s, waitlist = %s, link = %s, description = %s WHERE event_id = %s', (
          record['updated_at'].strftime( '%Y-%m-%d %H:%M:%S' ),
          record['starts_at'].strftime( '%Y-%m-%d %H:%M:%S' ),
          record['name'],
          record['maximum'],
          record['rsvp'],
          record['waitlist'],
          record['link'],
          record['description'],
          record['event_id']          
        )
      )

# Close the connection
connection.close()
