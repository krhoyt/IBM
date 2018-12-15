from datetime import datetime

import config
import mysql.connector
import os
import requests

def repository( name ):
  # Get repository details
  response = requests.get(
    url = 'https://api.github.com/repos/{0}'.format( name ),
    params = {
      'access_token': config.GitHub['token']
    }    
  )
  details = response.json()

  # Who moved my cheese?
  # Repository has been deleted
  if 'message' in details:
    if details['message'] == 'Not Found':
      return

  # Build record
  record = {
    'id': None,
    'repository_id': details['id'],
    'created_at': datetime.now(),
    'updated_at': datetime.now(),
    'name': details['name'],
    'full_name': details['full_name'],
    'description': details['description'],
    'started_at': datetime.strptime( details['created_at'], '%Y-%m-%dT%H:%M:%SZ' ),
    'pushed_at': datetime.strptime( details['pushed_at'], '%Y-%m-%dT%H:%M:%SZ' ),
    'size': details['size'],
    'stargazers': details['stargazers_count'],
    'watchers': details['watchers_count'],
    'language': details['language'],
    'forks': details['forks_count'],
    'issues': details['open_issues_count'],
    'network': details['network_count'],
    'subscribers': details['subscribers_count']
  }

  # Check if repository already captured
  cursor.execute( 
    'SELECT repository_id FROM Repository WHERE repository_id = %s', (
      record['repository_id'],
    ) 
  )
  found = cursor.fetchall()

  if len( found ) == 0:
    # Insert into database
    cursor.execute(
      'INSERT INTO Repository VALUES ( NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s )', (
        record['repository_id'],
        record['created_at'].strftime( '%Y-%m-%d %H:%M:%S' ),       
        record['updated_at'].strftime( '%Y-%m-%d %H:%M:%S' ), 
        record['name'],
        record['full_name'],
        record['description'],
        record['started_at'].strftime( '%Y-%m-%d %H:%M:%S' ), 
        record['pushed_at'].strftime( '%Y-%m-%d %H:%M:%S' ), 
        record['size'],
        record['stargazers'],
        record['watchers'],
        record['language'],
        record['forks'],
        record['issues'],
        record['network'],
        record['subscribers']
      )
    )          
  else:
    # Update record
    cursor.execute(
      'UPDATE Repository SET updated_at = %s, description = %s, pushed_at = %s, size = %s, stargazers = %s, watchers = %s, forks = %s, issues = %s, network = %s, subscribers = %s WHERE repository_id = %s', (
        record['updated_at'].strftime( '%Y-%m-%d %H:%M:%S' ), 
        record['description'],
        record['pushed_at'].strftime( '%Y-%m-%d %H:%M:%S' ), 
        record['size'],
        record['stargazers'],
        record['watchers'],
        record['forks'],
        record['issues'],
        record['network'],
        record['subscribers'],
        record['repository_id']
      )
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

# Get the accounts
cursor = connection.cursor( dictionary = True )  
cursor.execute( 'SELECT * FROM GitHub' )
accounts = cursor.fetchall()

for account in accounts:
  # Load the events for specific account
  response = requests.get(
    url = 'https://api.github.com/users/{0}/events/public'.format( account['github_id'] ),
    params = {
      'access_token': config.GitHub['token']
    }
  )
  events = response.json()

  for event in events:
    # Record to be inserted
    record = {
      'id': None,
      'github_id': account['id'],
      'created_at': datetime.now(),
      'updated_at': datetime.now(),
      'published_at': datetime.strptime( event['created_at'], '%Y-%m-%dT%H:%M:%SZ' ),
      'source_id': event['id'],
      'source_type': event['type'],
      'repository_id': event['repo']['id'],
      'repository_name': event['repo']['name']
    }

    # Debug output title
    if int( os.environ['DEBUG_OUTPUT'] ) == 1:
      print( event['id'] )

    # Store repository statistics
    repository( record['repository_name'] )

    # Check if event already captured
    cursor.execute( 
      'SELECT source_id FROM Source WHERE source_id = %s', (
        record['source_id'],
      ) 
    )
    found = cursor.fetchall()

    # Store new events
    if len( found ) == 0:
      # Insert into database
      cursor.execute(
        'INSERT INTO Source VALUES ( NULL, %s, %s, %s, %s, %s, %s, %s, %s )', (
          record['github_id'], 
          record['created_at'].strftime( '%Y-%m-%d %H:%M:%S' ), 
          record['updated_at'].strftime( '%Y-%m-%d %H:%M:%S' ), 
          record['published_at'].strftime( '%Y-%m-%d %H:%M:%S' ), 
          record['source_id'],
          record['source_type'],
          record['repository_id'],
          record['repository_name']
        )
      )      

# Close the connection
connection.close()
