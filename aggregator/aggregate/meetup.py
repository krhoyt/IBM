from datetime import datetime

import config
import mysql.connector
import os
import requests
import time
import uuid

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

cursor = connection.cursor( dictionary = True )  

# Meetup Pro organizations
sources = ['ibm-cloud', 'ibmdeveloper', 'ibm-big-data']

# Maintain parity with official lists
for source in sources:
  # Build query for Meetup Pro groups
  # Meetup Pro requires permissions
  # This is a hack based on the Web API
  query = '(endpoint:pro/{}/es_groups_summary,meta:(method:get),params:(only:\'cursor,total_count,chapters.lat,chapters.lon,chapters.status,chapters.name,chapters.urlname,chapters.id,chapters.country,chapters.state,chapters.city\',size:200),ref:mapMarkers,type:mapMarkers)'.format( source )

  # Get the groups for the organization
  response = requests.get(
    url = 'https://www.meetup.com/mp_api/pro/network',
    params = {
      'queries': query,
    }
  )
  data = response.json()
  groups = data['responses'][0]['value']['chapters']

  # Check each of the groups
  for group in groups:
    # Is group in database
    cursor.execute( 
      'SELECT meetup_id, updated_at FROM Meetup WHERE meetup_id = %s', (
        group['id'],
      ) 
    )
    found = cursor.fetchall()  

    if len( found ) == 0:
      # Group does not exist in database
      # Adding group to database
      print( 'Adding: {}'.format( group['name'] ) )

      # Get group record from official Meetup API
      response = requests.get(
        url = 'https://api.meetup.com/{0}'.format( group['urlname'] ),
        params = {
          'sign': True,
          'key': config.Meetup['key']
        }
      )
      item = response.json()        

      # Parse founded date from milliseconds
      # TODO: Isolate bug that causes key to not be found
      # TODO: Context switch from previous iteration
      founded_at = datetime.fromtimestamp( item['created'] / 1000 )

      # Insert into database
      cursor.execute(
        'INSERT INTO Meetup VALUES ( NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s )', (
          str( uuid.uuid4() ),
          1,
          datetime.now().strftime( '%Y-%m-%d %H:%M:%S' ),
          datetime.now().strftime( '%Y-%m-%d %H:%M:%S' ),
          founded_at.strftime( '%Y-%m-%d %H:%M:%S' ),
          item['id'],
          item['name'],
          item['urlname'],
          item['link'],
          item['members'],
          item['description'],
          item['city'],
          item['lat'],
          item['lon']
        )
      )    
    else:
      # Group does exist in database
      print( 'Found: {}'.format( group['name'] ) )

      # Update the group
      # Once per week is fine
      if ( datetime.now() - found[0]['updated_at'] ).days >= 7:
        print( 'Updating: {}'.format( group['name'] ) )

        # Get group record from official Meetup API
        response = requests.get(
          url = 'https://api.meetup.com/{0}'.format( group['urlname'] ),
          params = {
            'sign': True,
            'key': config.Meetup['key']
          }
        )
        item = response.json()        

        # Parse founded date from milliseconds
        founded_at = datetime.fromtimestamp( item['created'] / 1000 )

        cursor.execute(
          'UPDATE Meetup SET updated_at = %s, founded_at = %s, meetup_id = %s, name = %s, url_name = %s, link = %s, members = %s, description = %s, city = %s, latitude = %s, longitude = %s WHERE meetup_id = %s', (
            datetime.now().strftime( '%Y-%m-%d %H:%M:%S' ),
            founded_at.strftime( '%Y-%m-%d %H:%M:%S' ),
            item['id'],
            item['name'],
            item['urlname'],
            item['link'],
            item['members'],
            item['description'],
            item['city'],
            item['lat'],
            item['lon'],
            item['id']
          )
        )      

# Get the account list
# Refresh to be inclusive of previous work
# TODO: Possible optimize by inserting record
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
