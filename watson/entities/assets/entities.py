import json
import requests
import sys

# Read configuration options
with open( '../bluemix/config.json' ) as data_file:    
  config = json.load( data_file )

# URL for Conversation API call
url = '{0}{1}{2}{3}{4}'.format( 
  'https://gateway.watsonplatform.net',
  '/conversation/api/v1/workspaces/',
  config['workspace'],
  '/message?',
  'version=2017-05-26'  
)

# JSON
headers = {
  'Content-Type': 'application/json'
}

# Optional command line
if len( sys.argv ) > 1:
  text = sys.argv[1]
else:
  text = 'It was three days ago.'

# Example phrase
data = {
  'input': {
    'text': text
  }
}

# Call Conversation API
req = requests.post( 
  url,
  auth = ( 
    config['username'], 
    config['password'] 
  ),
  headers = headers, 
  data = json.dumps( data ) 
)
res = req.json()

# Print any found system entities (date, location, etc.)
# https://www.ibm.com/watson/developercloud/doc/conversation/system-entities.html
for entity in res['entities']:
  parts = entity['entity'].split( '-' )
  print '{0}\t{1}\t{2}\t{3}%'.format(
    parts[1],
    text[entity['location'][0]:entity['location'][1]],
    entity['value'],
    int( entity['confidence'] * 100 )
  )
