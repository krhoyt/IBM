from datetime import datetime

import config
import feedparser
import isodate
import mysql.connector
import os
import requests

def get_duration( id ):
  # Request video details from YouTube API
  response = requests.get(
    url = 'https://www.googleapis.com/youtube/v3/videos',
    params = {
      'id': id,
      'part': 'contentDetails',
      'key': config.YouTube['key']
    }
  )
  data = response.json()

  # Parse the duration
  # PT6M38S = 6 minues, 38 seconds
  timing = data['items'][0]['contentDetails']['duration']
  duration = isodate.parse_duration( timing )
  
  # Return duration in seconds
  return int( duration.total_seconds() )

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

# Get the channels
cursor = connection.cursor( dictionary = True )  
cursor.execute( 'SELECT * FROM YouTube' )
content = cursor.fetchall()

for channel in content:
  # Load and parse raw feed data
  # Avoids managing certificates  
  response = requests.get(
    url = 'https://www.youtube.com/feeds/videos.xml',
    params = {
      'channel_id': channel['channel_id']
    }
  )
  rss = feedparser.parse( response.text )  

  for entry in rss.entries:
    # Debug
    if int( os.environ['DEBUG_OUTPUT'] ) == 1:    
      print( entry['title'] )

    # Duration of video in seconds
    # Requires additional call to YouTube API
    duration = get_duration( entry['yt_videoid'] )  

    # Record to be inserted
    record = {
      'youtube_id': channel['id'],
      'created_at': datetime.now(),
      'updated_at': datetime.now(),
      'published_at': datetime.now(),
      'guid': entry['id'],
      'video_id': entry['yt_videoid'],
      'channel_id': entry['yt_channelid'],
      'link': entry['link'],
      'title': entry['title'],
      'views': entry.media_statistics['views'],
      'stars': entry.media_starrating['count'],
      'duration': get_duration( entry['yt_videoid'] ),
      'thumbnail': entry.media_thumbnail[0]['url'],
      'summary': entry['summary']
    }

    # Determine published date
    if 'published_parsed' in entry:
      record['published_at'] = datetime( *( entry['published_parsed'][0:6] ) )    

    # Check if video is already captured
    cursor.execute( 
      'SELECT guid FROM Video WHERE guid = %s', (
        record['guid'],
      ) 
    )
    found = cursor.fetchall()

    # Store new video
    if len( found ) == 0:
      cursor.execute(
        'INSERT INTO Video VALUES ( NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s )', (
          record['youtube_id'], 
          record['created_at'].strftime( '%Y-%m-%d %H:%M:%S' ), 
          record['updated_at'].strftime( '%Y-%m-%d %H:%M:%S' ),
          record['published_at'].strftime( '%Y-%m-%d %H:%M:%S' ),
          record['guid'],
          record['video_id'],
          record['channel_id'],
          record['link'],
          record['title'],
          record['views'],
          record['stars'],
          record['duration'],
          record['thumbnail'],
          record['summary']
        )
      )      
    else:
      # Update with statistics if already exists
      cursor.execute(
        'UPDATE Video SET views = %s, stars = %s WHERE guid = %s', (
          record['views'],
          record['stars'],          
          record['guid']
        )
      )

# Close the connection
connection.close()
