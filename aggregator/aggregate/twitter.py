import config
import ibm_boto3
import mysql.connector
import os
import requests

from datetime import datetime
from ibm_botocore.client import Config
from ibm_botocore.exceptions import ClientError

# Check if media exists in object storage
# If not then download to local
# Then put in object storage
def store( id, url ):
  index = url.rfind( '.' )
  key = id + url[index:]

  try:
    cos.ObjectSummary(
      bucket_name = config.ObjectStorage['media'], 
      key = key
    ).load()
  except ClientError as e:
    if e.response['Error']['Code'] == '404':
      response = requests.get( url )
      cos.Object( 
        config.ObjectStorage['media'], 
        key 
      ).put( Body = response.content )
    else:
      raise e

# Check and store mentions
def mentions( values ):
  result = ''

  # For each mention
  for people in values:
    # Have we already mentioned to this person
    cursor.execute( 
      'SELECT * FROM Mention WHERE screen_name = %s', (
        people['screen_name'],
      )
    )
    record = cursor.fetchall()      

    # If we have not
    # Get user statistics
    # Insert them into the database
    # Otherwise update their statistics
    if len( record ) == 0:
      # Get user statistics
      details = profile( people['id_str'], people['screen_name'] )

      # User does not allow access to profile
      if details is None:
        continue

      cursor.execute( 
        'INSERT INTO Mention VALUES( NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s )', (
          datetime.now().strftime( '%Y-%m-%d %H:%M:%S' ),
          datetime.now().strftime( '%Y-%m-%d %H:%M:%S' ),          
          details['joined_at'],
          details['user_id'],
          details['screen_name'],
          details['name'],
          details['followers'],
          details['friends'],
          details['listed'],        
          details['favorites'],        
          details['count'],
          details['location'],
          details['description']
        )
      )
    else:
      # Does the record even need updating
      if ( datetime.now() - record[0]['updated_at'] ).days >= 7: 
        # Get user statistics
        details = profile( people['id_str'], people['screen_name'] )
      
        # User does not allow access to profile
        if details is None:
          continue

        cursor.execute( 
          'UPDATE Mention SET updated_at = %s, joined_at = %s, followers = %s, friends = %s, listed = %s, favorites = %s, count = %s, location = %s, description = %s WHERE id = %s', (
            datetime.now().strftime( '%Y-%m-%d %H:%M:%S' ),
            details['joined_at'],
            details['followers'],
            details['friends'],
            details['listed'],        
            details['favorites'],        
            details['count'],
            details['location'],
            details['description'],
            record[0]['id']
          )  
        )    

    # Build CSV list for return
    result = result + ',' + people['screen_name']

  return result[1:] if len( result ) > 0 else None

# Check and store media
def photos( status_id, published, values ):
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

        # Store reference in database
        # Includes original URL
        cursor.execute(
          'INSERT INTO Media VALUES ( NULL, %s, %s, %s, %s, %s, %s, %s )', (
            datetime.now().strftime( '%Y-%m-%d %H:%M:%S' ),
            datetime.now().strftime( '%Y-%m-%d %H:%M:%S' ),
            published.strftime( '%Y-%m-%d %H:%M:%S' ),
            status_id,
            link['id_str'], 
            link['media_url'],
            keywords
          )
        )

        # Download and put image file into object store
        # If it does not already exist
        # Reference by media ID
        store( link['id_str'], link['media_url'] )

def profile( id, name ):
  # Get single Twitter status
  # For given screen name
  # Will include user profile
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
  data = response.json()

  # Check for access error
  # User has blocked access to timeline
  # TODO: Log exceptions
  if 'error' in data:
    print( 'Access denied: {0} {1}'.format( id, name ) )
    return None

  # Account has been deleted
  # TODO: Delete from database if present
  if 'errors' in data:
    print( 'Account removed: {0}'.format( name ) )
    return None

  # Account present
  # No status updates have been made
  if len( data ) == 0:
    print( 'No status updates: {0}'.format( name ) )
    return None

  # Parse and return specifics
  return {
    'joined_at': datetime.strptime( data[0]['user']['created_at'], '%a %b %d %H:%M:%S +%f %Y' ),
    'user_id': data[0]['user']['id_str'],
    'screen_name': data[0]['user']['screen_name'],
    'name': data[0]['user']['name'],
    'followers': data[0]['user']['followers_count'],
    'friends': data[0]['user']['friends_count'],
    'listed': data[0]['user']['listed_count'],        
    'favorites': data[0]['user']['favourites_count'],        
    'count': data[0]['user']['statuses_count'],
    'location': None if len( data[0]['user']['location'] ) == 0 else data[0]['user']['location'],
    'description': None if len( data[0]['user']['description'] ) == 0 else data[0]['user']['description']
  }

def timeline( id, name ):
  response = requests.get(
    url = config.Twitter['timeline'],
    headers = {
      'Authorization': 'Bearer ' + config.Twitter['token']
    },
    params = {
      'screen_name': name,
      'count': config.Twitter['count'],
      'tweet_mode': 'extended'
    }
  )
  data = response.json()

  # Check for access error
  # User has blocked access to timeline
  if 'error' in data:
    print( 'Access denied: {0} {1}'.format( id, name ) )
    return None

  results = []

  for status in data:
    record = {
      'id': None,
      'twitter_id': id,
      'created_at': datetime.now(),
      'updated_at': datetime.now(),
      'published_at': datetime.now(),
      'status_id': status['id_str'],
      'link': 'https://twitter.com/{0}/status/{1}'.format( name, status['id_str'] ),
      'text': status['full_text'],
      'favorite': status['favorite_count'],
      'retweet': status['retweet_count'],
      'hashtags': None,
      'mentions': None,
      'media': None
    }

    # Parse publish date
    record['published_at'] = datetime.strptime( status['created_at'], '%a %b %d %H:%M:%S +%f %Y' )

    # Hashtag entity to CSV list
    tags = ''

    for tag in status['entities']['hashtags']:
      tags = tags + ',' + tag['text']

    record['hashtags'] = None if len( tags ) == 0 else tags[1:]

    # Mentions
    # Recorded and updated as they appear
    # Every timeline
    # Every status
    if 'user_mentions' in status['entities']:
      record['mentions'] = mentions( status['entities']['user_mentions'] ) 

    # Media references
    # Store but do not fetch
    # Fetch later if needed
    if 'media' in status['entities']:
      record['media'] = status['entities']['media']

    results.append( record )

  return results

def visual( url ):
  # Send image to Watson for processing
  # Visual Recognition
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

  # Keywords result
  # CSV list
  result = ''

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

# Cloud Object Storage
# Used for media
cos = ibm_boto3.resource( 's3',
  ibm_api_key_id = config.ObjectStorage['key'],
  ibm_service_instance_id = config.ObjectStorage['instance'],
  ibm_auth_endpoint = config.ObjectStorage['auth'],
  config = Config( signature_version = 'oauth' ),
  endpoint_url = config.ObjectStorage['endpoint']
)

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
cursor.execute( 'SELECT * FROM Twitter' )
twitter = cursor.fetchall()

for account in twitter:
  # Check if account needs updating
  # To reflect statistics
  if ( datetime.now() - account['updated_at'] ).days >= 7:
    # Get individual user details
    record = profile( account['id'], account['screen_name'] )

    if record != None:
      # Update statistics
      cursor.execute( 
        'UPDATE Twitter SET updated_at = %s, followers = %s, friends = %s, listed = %s, favorites = %s, count = %s, location = %s, description = %s WHERE advocate_id = %s', (
          datetime.now().strftime( '%Y-%m-%d %H:%M:%S' ),
          record['followers'],
          record['friends'],
          record['listed'],        
          record['favorites'],        
          record['count'],
          record['location'],
          record['description'],
          account['advocate_id']
        )  
      )    

  # Get account timeline
  updates = timeline( account['id'], account['screen_name'] )

  # Process timeline updates
  for status in updates:
    # Debug
    if int( os.environ['DEBUG_OUTPUT'] ) == 1:    
      print( status['status_id'] )

    # Check if status already exists
    cursor.execute( 
      'SELECT status_id FROM Status WHERE status_id = %s', (
        status['status_id'],
      ) 
    )
    found = cursor.fetchall()

    # Change database accordingly
    # Insert status
    # Update status for favorite, retweet
    if len( found ) == 0:
      # Get media if there is media to be had
      # Media data does not change
      # Only create record
      # No need to go back and update over time
      # TODO: Disk storage ... somewhere (Box?, Object Storage?)
      if status['media'] is not None:
        photos( status['status_id'], status['published_at'], status['media'] )

      # New
      cursor.execute(
        'INSERT INTO Status VALUES ( NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s )', (
          status['twitter_id'],
          status['created_at'].strftime( '%Y-%m-%d %H:%M:%S' ),
          status['updated_at'].strftime( '%Y-%m-%d %H:%M:%S' ),
          status['published_at'].strftime( '%Y-%m-%d %H:%M:%S' ),
          status['status_id'],
          status['link'],
          status['text'],
          status['favorite'],
          status['retweet'],
          status['hashtags'],
          status['mentions']
        )
      )
    else:
      # Existing
      cursor.execute( 
        'UPDATE Status SET updated_at = %s, favorite = %s, retweet = %s WHERE status_id = %s', (
          status['updated_at'].strftime( '%Y-%m-%d %H:%M:%S' ),
          status['favorite'],
          status['retweet'],
          status['status_id']
        )  
      )

# Close the connection
connection.close()
