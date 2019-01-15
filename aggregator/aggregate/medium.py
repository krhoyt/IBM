from datetime import datetime

import config
import feedparser
import mysql.connector
import nlu
import os
import requests
import uuid

def claps( url ):
  marker = 'totalClapCount":'

  response = requests.get( url )
  start = response.text.find( marker ) + len( marker )
  end = response.text.find( ',', start )
  part = response.text[start:end]

  return int( part )

def follows( id, url ):
  following_delim = 'usersFollowedCount":'
  followed_delim = 'usersFollowedByCount":'

  page = requests.get( url )

  start = page.text.find( following_delim ) + len( following_delim )
  end = page.text.find( ',', start )
  following = int( page.text[start:end] )

  start = page.text.find( followed_delim ) + len( followed_delim )
  end = page.text.find( ',', start )
  followed = int( page.text[start:end] )

  cursor.execute( 'UPDATE Medium SET updated_at = %s, following = %s, followed_by = %s WHERE id = %s', (
      datetime.now().strftime( '%Y-%m-%d %H:%M:%S' ),
      following,
      followed,
      id
    )
  )

  return {'following': following, 'followed_by': followed}

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

# Get the Medium feeds
cursor = connection.cursor( dictionary = True )  
cursor.execute( 'SELECT * FROM Medium' )
feeds = cursor.fetchall()

# Iterate Medium accounts
for feed in feeds:
  # Load and parse raw feed data
  # Avoids managing certificates
  response = requests.get( feed['feed'] )

  # TODO: Include updated feedparser in Docker build
  # https://github.com/kurtmckee/feedparser/issues/131
  rss = feedparser.parse( response.text )  

  # Update Medium account with latest statistics
  # Following and followed by
  if ( datetime.now() - feed['updated_at'] ).days >= 7:
    follows( feed['id'], rss.entries[0].link )

  # Iterate RSS feed entries
  for entry in rss.entries:
    # Record to be inserted
    # TODO: Consider stripping HTML
    record = {
      'id': None,
      'uuid': str( uuid.uuid4() ),
      'medium_id': feed['id'],
      'created_at': datetime.now(),
      'updated_at': datetime.now(),
      'published_at': datetime( *( entry['published_parsed'][0:6] ) ),
      'guid': entry['id'],
      'link': entry['link'],
      'title': entry['title'],
      'summary': entry['summary'],
      'claps': 0,
      'category': None,
      'keywords': None,
      'concepts': None,
      'entities': None
    }

    # Medium includes comments as main RSS feed items
    # Not interested in those comments for this pass
    if 'tags' not in entry:
      continue

    # Get article categories
    tags = ''

    if 'tags' in entry:
      for tag in entry['tags']:
        tags = tags + ',' + tag.term

      # Put tags into category field
      record['category'] = tags[1:]

    # Debug output title
    if int( os.environ['DEBUG_OUTPUT'] ) == 1:
      print( entry['title'] )

    # Check if article already captured
    cursor.execute( 
      'SELECT guid, updated_at FROM Article WHERE guid = %s', (
        record['guid'],
      ) 
    )
    found = cursor.fetchall()

    # Store new posts
    if len( found ) == 0:
      # Parse claps from article
      record['claps'] = claps( record['link'] )      

      # NLU on raw blog post
      # Returns keywords, concepts, and entities
      language = nlu.nlu( record['link'] )

      # Insert into database
      cursor.execute(
        'INSERT INTO Article VALUES ( NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s )', (
          record['uuid'], 
          record['medium_id'], 
          record['created_at'].strftime( '%Y-%m-%d %H:%M:%S' ), 
          record['updated_at'].strftime( '%Y-%m-%d %H:%M:%S' ), 
          record['published_at'].strftime( '%Y-%m-%d %H:%M:%S' ), 
          record['guid'],
          record['link'],
          record['title'],
          record['summary'],
          record['claps'],
          record['category'],
          None if len( language['keywords'] ) == 0 else language['keywords'],
          None if len( language['concepts'] ) == 0 else language['concepts'],
          None if len( language['entities'] ) == 0 else language['entities']
        )
      )     
    else:
      # More than a week has elapsed
      if ( datetime.now() - found[0]['updated_at'] ).days >= 7:
        record['claps'] = claps( record['link'] )

        cursor.execute(
          'UPDATE Article SET updated_at = %s, claps = %s WHERE guid = %s', (
            datetime.now().strftime( '%Y-%m-%d %H:%M:%S' ),
            record['claps'],
            found[0]['guid']  
          )
        )       

# Close the connection
connection.close()
