import json
import pathlib

from PIL import Image

# Load configuration
with open( 'config.json' ) as data_file:    
  config = json.load( data_file )

# For each entry in the given path
# Path specified in configuration
for part in pathlib.Path( config['path'] ).iterdir():
  # If entry is a file
  if part.is_file():
    # But not a hidden file
    # Looking at you .DS_Store
    if part.parts[1].startswith( '.' ):
      continue

    # Overwrites existing

    # Show progress
    print( part.parts[1] )

    # Load image
    image = Image.open( str( part ) )

    # For each of the desired clip regions
    # Specified in configuration
    for clip in config['slices']:
      # Path to store given clip
      label = '{}/{}'.format( 
        config['path'],
        clip['label']
      )

      # Make directory if it does not exist
      pathlib.Path( label ).mkdir( parents = True, exist_ok = True )       

      # What to clip
      box = ( 
        clip['x'], 
        clip['y'],
        clip['x'] + clip['width'],
        clip['y'] + clip['height']
      )

      # Clip
      # Save
      sample = image.crop( box )
      sample.save( '{}/{}/{}'.format(
        config['path'],
        clip['label'],
        part.parts[1]
      ) )
