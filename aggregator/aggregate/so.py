from datetime import datetime

import config
import mysql.connector
import nlu
import os
import requests
import time

def get_question( id ):
  # Get specific question details
  response = requests.get(
    url = 'https://api.stackexchange.com/2.2/questions/{0}'.format( id ),
    params = {
      'order': 'desc',
      'sort': 'activity',
      'site': 'stackoverflow',
      'key': config.StackOverflow['key']
    }
  )   
  data = response.json()['items'] 

  # Assemble result values
  # Tags requires additional iteration
  result = {
    'link': data[0]['link'],
    'title': data[0]['title'],
    'tags': ''
  }

  # Iterate over tags
  for tag in data[0]['tags']:
    result['tags'] = result['tags'] + ',' + tag

  # Clean up leading comma
  result['tags'] = result['tags'][1:]

  return result;

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
cursor.execute( 'SELECT * FROM StackOverflow' )
accounts = cursor.fetchall()

for person in accounts:
  response = requests.get(
    url = 'https://api.stackexchange.com/2.2/users/{0}/answers'.format( person['user_id'] ),
    params = {
      'order': 'desc',
      'sort': 'activity',
      'site': 'stackoverflow',
      'pagesize': 100,
      'key': config.StackOverflow['key']      
    }
  )
  items = response.json()['items']

  # Marker for updating statistics
  owner = False

  for answer in items:
    # Debug
    if int( os.environ['DEBUG_OUTPUT'] ) == 1:
      print( answer['answer_id'] )

    # Record to be inserted
    record = {
      'id': None,
      'so_id': person['id'],
      'created_at': datetime.now(),
      'updated_at': datetime.now(),
      'answer_id': answer['answer_id'],
      'question_id': answer['question_id'],
      'answered_at': time.gmtime( answer['creation_date'] ),
      'active_at': time.gmtime( answer['last_activity_date'] ),
      'score': answer['score'],
      'accepted': 0 if answer['is_accepted'] == False else 1,
      'link': None,
      'title': None,
      'tags': None,
      'keywords': None,
      'concepts': None,
      'entities': None
    }    

    # Get owner details on first record
    if owner == False:
      # Check if account needs updating
      # To reflect statistics
      if ( datetime.now() - person['updated_at'] ).days >= 7:
        cursor.execute(
          'UPDATE StackOverflow SET updated_at = %s, reputation = %s, accept_rate = %s, name = %s WHERE id = %s', (
            datetime.now().strftime( '%Y-%m-%d %H:%M:%S' ),
            answer['owner']['reputation'],
            answer['owner']['accept_rate'] if 'accept_rate' in answer['owner'] else None,
            answer['owner']['display_name'],
            person['id']
          )
        )

        # Mark as updated
        # Avoid updating for each answer item
        owner = True

    # Check if answer already captured
    cursor.execute( 
      'SELECT answer_id FROM Answer WHERE answer_id = %s', (
        record['answer_id'],
      ) 
    )
    found = cursor.fetchall()

    if len( found ) == 0:
      # Make additional request for question details
      # Returns link, title, and tags
      question = get_question( answer['question_id'] )

      # NLU on raw blog post
      # Returns keywords, concepts, and entities
      language = nlu.nlu( question['link'] )

      cursor.execute(
        'INSERT INTO Answer VALUES ( NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s )', (
          record['so_id'],
          record['created_at'].strftime( '%Y-%m-%d %H:%M:%S' ),
          record['updated_at'].strftime( '%Y-%m-%d %H:%M:%S' ),
          record['answer_id'],
          record['question_id'],
          time.strftime( '%Y-%m-%d %H:%M:%S', record['answered_at'] ),
          time.strftime( '%Y-%m-%d %H:%M:%S', record['active_at'] ),
          record['score'],
          record['accepted'],
          question['link'],
          question['title'],
          question['tags'], 
          None if len( language['keywords'] ) == 0 else language['keywords'],
          None if len( language['concepts'] ) == 0 else language['concepts'],
          None if len( language['entities'] ) == 0 else language['entities']
        )
      )      
    else:
      cursor.execute(
        'UPDATE Answer SET updated_at = %s, active_at = %s, score = %s, accepted = %s WHERE answer_id = %s', (
          record['updated_at'].strftime( '%Y-%m-%d %H:%M:%S' ),
          time.strftime( '%Y-%m-%d %H:%M:%S', record['active_at'] ),
          record['score'],
          record['accepted'],
          record['answer_id']          
        )
      )

# Close the connection
connection.close()
