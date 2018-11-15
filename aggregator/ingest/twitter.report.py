import config
import datetime
import mysql.connector

# Connect to Compose MySQL
connection = mysql.connector.connect(
  user = config.MySQL['user'],
  password = config.MySQL['password'],
  host = config.MySQL['host'],
  port = config.MySQL['port'],
  database = config.MySQL['database'],
  ssl_ca = config.MySQL['certificate']
)

# Get the tweets list
cursor = connection.cursor()  
cursor.execute( 
  'SELECT Staff.twitter, Twitter.text ' + 
  'FROM Staff, Twitter ' +
  'WHERE Twitter.staff_id = Staff.id ' +
  'AND created_at >= %s ' +
  'ORDER BY created_at', (
  datetime.datetime.now().strftime( '%Y-%m-%d 00:00:00' ),
) )
timeline = cursor.fetchall()

# Show 'em
for tweet in timeline:
  print( tweet[0] + ': ' + tweet[1] )
