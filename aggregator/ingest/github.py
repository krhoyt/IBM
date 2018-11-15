from datetime import datetime

import config
import mysql.connector
import requests

def repository( name ):
  cursor.execute( 
    'SELECT name, count FROM Repository WHERE name = %s', (
      name,
    ) 
  )
  found = cursor.fetchall()  

  if len( found ) == 0:
    url = '{}{}'.format(
      'https://api.github.com/repos/',
      name
    )

    response = requests.get( 
      url,
      params = {
        'access_token': config.GitHub['token']
      }
    )
    data = response.json()  

    if 'stargazers_count' in data:
      cursor.execute(
        'INSERT INTO Repository VALUES ( NULL, %s, %s, %s, %s, %s, %s, %s )', (
          name, 
          0,
          data['stargazers_count'],
          data['watchers_count'],
          data['forks_count'],
          data['open_issues_count'],
          data['language']
        )
      )

      connection.commit()          
  else:
    cursor.execute(
      'UPDATE Repository SET count = %s WHERE name = %s', (
        found[0][1] + 1,
        found[0][0]
      )
    )

    connection.commit()    

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
  if person[10] == None:
    continue

  url = '{}{}{}'.format(
    'https://api.github.com/users/',
    person[10],
    '/events/public'
  )

  response = requests.get( 
    url,
    params = {
      'access_token': config.GitHub['token']
    }
  )
  data = response.json()

  for event in data:
    print( event['repo']['name'] )

    cursor.execute( 
      'SELECT github_id FROM GitHub WHERE github_id = %s', (
        event['id'],
      ) 
    )
    found = cursor.fetchall()

    if len( found ) == 0:
      created = datetime.strptime( event['created_at'], '%Y-%m-%dT%H:%M:%SZ' )

      cursor.execute(
        'INSERT INTO GitHub VALUES ( NULL, %s, %s, %s, %s, %s )', (
          person[0], 
          event['id'],
          created.strftime( '%Y-%m-%d %H:%M:%S' ),
          event['type'],
          event['repo']['name']
        )
      )

      connection.commit()

      repository( event['repo']['name'] )
