from datetime import datetime

import config
import feedparser
import mysql.connector
import nlu
import os
import requests

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

# Get the blogs
# Some users have a blog but no feed
cursor = connection.cursor( dictionary = True )  
cursor.execute( 'SELECT * FROM Blog WHERE feed IS NOT NULL' )
blogs = cursor.fetchall()

for blog in blogs:
  # Load and parse raw feed data
  # Avoids managing certificates
  response = requests.get( blog['feed'] )
  rss = feedparser.parse( response.text )  

  for entry in rss.entries:
    # Record to be inserted
    # TODO: Consider stripping HTML
    record = {
      'id': None,
      'blog_id': blog['id'],
      'created_at': datetime.now(),
      'updated_at': datetime.now(),
      'published_at': datetime.now(),
      'guid': entry['id'],
      'link': entry['link'],
      'title': entry['title'],
      'summary': entry['summary'],
      'category': None,
      'keywords': None,
      'concepts': None,
      'entities': None
    }

    # Determine published date
    if 'created_parsed' in entry:
      record['published_at'] = datetime( *( entry['created_parsed'][0:6] ) )

    if 'published_parsed' in entry:
      record['published_at'] = datetime( *( entry['published_parsed'][0:6] ) )

    if 'updated_parsed' in entry:
      record['published_at'] = datetime( *( entry['updated_parsed'][0:6] ) )      

    # Medium includes comments as main RSS feed items
    # Not interested in those comments for this pass
    if blog['feed'].find( 'https://medium.com/feed/' ) >= 0:
      if 'tags' not in entry:
        continue

    # Get post tags
    tags = ''

    if 'tags' in entry:
      for tag in entry['tags']:
        tags = tags + ',' + tag.term

      # Put tags into category field
      record['category'] = tags[1:]

    # Debug output title
    if int( os.environ['DEBUG_OUTPUT'] ) == 1:
      print( entry['title'] )

    # Check if post already captured
    # TODO: Track updates since published
    cursor.execute( 
      'SELECT guid FROM Post WHERE guid = %s', (
        record['guid'],
      ) 
    )
    found = cursor.fetchall()

    # Store new posts
    if len( found ) == 0:
      # NLU on raw blog post
      # Returns keywords, concepts, and entities
      language = nlu.nlu( record['link'] )

      # Insert into database
      cursor.execute(
        'INSERT INTO Post VALUES ( NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s )', (
          record['blog_id'], 
          record['created_at'].strftime( '%Y-%m-%d %H:%M:%S' ), 
          record['updated_at'].strftime( '%Y-%m-%d %H:%M:%S' ), 
          record['published_at'].strftime( '%Y-%m-%d %H:%M:%S' ), 
          record['guid'],
          record['link'],
          record['title'],
          record['summary'],
          record['category'],
          None if len( language['keywords'] ) == 0 else language['keywords'],
          None if len( language['concepts'] ) == 0 else language['concepts'],
          None if len( language['entities'] ) == 0 else language['entities']
        )
      )      

# Close the connection
connection.close()
