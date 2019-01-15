import config
import mysql.connector
import os
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

# Get the posts
cursor = connection.cursor( dictionary = True )  
cursor.execute( 'SELECT * FROM Post WHERE uuid = \'\'' )
posts = cursor.fetchall()

for post in posts:
  cursor.execute( 'UPDATE Post SET uuid = %s WHERE id = %s', (
      str( uuid.uuid4() ),
      post['id']
    )
  )

# Close the connection
connection.close()
