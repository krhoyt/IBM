import config
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

# Get all keywords from all blog posts
cursor = connection.cursor()  
cursor.execute( 'SELECT keywords FROM Blog' )
words = cursor.fetchall()

# Key-value store
# Key is keyword
# Value is counter
points = {}

for word in words:
  parts = word[0].split( ',' )

  for part in parts:
    if part in points:
      points[part] = points[part] + 1
    else:
      points[part] = 1

# Sort by value
results = sorted( points.items(), key = lambda kv: kv[1] )

# Display values
print( results )
