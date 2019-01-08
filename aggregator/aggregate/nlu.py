import config
import requests

def nlu( url ):
  # Ask Watson for analysis
  # Natural Language Understanding
  response = requests.get(
    url = config.NLU['url'],
    auth = (
      config.NLU['key'],
      config.NLU['secret']
    ),
    params = {
      'url': url,
      'version': config.NLU['version'],
      'features': 'concepts,keywords,entities'
    }
  ) 
  data = response.json()

  # Condensed data
  # Not all Watson details are needed
  # Return only specific analysis
  result = {
    'keywords': [],
    'concepts': [],
    'entities': []
  }

  # Fill results
  # Reduce keywords
  # References stopwords
  # Reject duplicates
  if 'keywords' in data:
    result['keywords'] = reduce( data['keywords'] )
    result['entities'] = reduce( data['entities'] )    

  # Concepts not supported in all languages
  if 'concepts' in data:
    result['concepts'] = reduce( data['concepts'] )

  return result

def reduce( values ):
  combined = []
  unique = []

  # Look at analysis results
  for key in values:
    # Some degree of confidence
    if key['relevance'] < 0.50:
      continue

    # Words with spaces
    # Becomes individual words
    if key['text'].find( ' ' ) > -1:
      parts = key['text'].split( ' ' )

      for part in parts:
        combined.append( part.strip().lower() )

  # Look at all the words
  for word in combined:
    found = False

    # Is this word unique
    for item in unique:
      if item == word:
        found = True
        break

    # Is word in stopwords
    # Filter out common words
    for stop in stopwords:
      if stop == word:
        found = True
        break

    # Put into list of words
    if found == False:
      unique.append( word )

  # Result is CSV
  csv = ''

  # Buld CSV string
  for word in unique:
    csv = csv + ',' + word

  csv = csv[1:]

  # Keep limited in scope
  # Truncate at a comma
  if len( csv ) > 255:
    csv = csv[0:255]
    index = csv.rfind( ',' )
    csv = csv[0:index]

  return csv  

# Stop words
# Used to minimize NLU results
file = open( 'stopwords.txt', 'r' )

if file.mode == 'r':
  listing = file.read()

file.close()

stopwords = listing.split( '\n' )
