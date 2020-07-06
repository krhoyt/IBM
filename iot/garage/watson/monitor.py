import json
import paho.mqtt.client as mqtt
import picamera
import requests
import time

from PIL import Image

# Capture images from camera
def capture():
  with picamera.PiCamera() as camera:
    # Resolution
    # Positioning
    camera.resolution = ( config['camera']['x'], config['camera']['y'] )
    camera.framerate = config['camera']['framerate']
    camera.vflip = False    
    camera.rotation = 90
		
    # Camera warm-up
    camera.start_preview()
    time.sleep( 5 )
		
    # Capture
    # To same file every time
    camera.capture( 
      config['camera']['photo_name'], 
      quality = config['camera']['quality'] 
    )		
	
  return True

def recognize( label ):
  path = '{}.{}'.format(
	label,
    config['camera']['photo_name']
  )
  part = {'images_file': open( path, 'rb' )}

  response = requests.post(
    config['watson']['url'],
    params = {
      'api_key': config['watson']['api_key'],
      'version': config['watson']['version'],
    },
    files = part,
    data = {
      'classifier_ids': config['watson']['classifier']
    }
  )

  return response.json()

def slice( label, x, y, width, height ):
  # Load image for processing
  image = Image.open( config['camera']['photo_name'] )  
  
  # TODO: Rework sizing across all
  image.thumbnail( ( 640, 480 ), Image.ANTIALIAS )

  box = ( 
    x, 
    y,
    x + width,
    y + height
  )

  # Clip
  # Save
  sample = image.crop( box )
  sample.save( '{}.{}'.format(
    label,
    config['camera']['photo_name']
  ) )  

# Connected to Watson IoT (broker)
def on_connect( client, userdata, flags, rc ):
  print( 'Connected: ' + str( rc ) )

  # Subscribe to commands
  client.subscribe( config['iot']['command'] )

# Message arrived
def on_message( client, userdata, msg ):
  print( str( msg.payload ) )

  # Parse JSON payload
  data = json.loads( msg.payload.decode( 'utf-8' ) )  

  # Look for desired image slice
  for parts in config['slices']:
    if parts['label'] == data['label']:
      # Slice out desired part
      slice( 
        parts['label'], 
        parts['x'],
        parts['y'],
        parts['width'],
        parts['height']
      )      
      
      # Classify
      watson = recognize( parts['label'] )
 
      # Debug
      print( watson['images'][0]['classifiers'][0]['classes'][0]['class'] )
      
      # Send event with data to clients
      client.publish( config['iot']['event'], json.dumps( watson ) ) 
      
      break
      
# Load configuration
with open( 'config.json' ) as data_file:    
  config = json.load( data_file )

# MQTT client
client = mqtt.Client( 'd:{}:{}:{}'.format(
  config['iot']['organization'],
  config['iot']['type'],
  config['iot']['id']
) )

# Authentication
client.username_pw_set( 'use-token-auth', config['iot']['token'] )

# Handlers
client.on_connect = on_connect
client.on_message = on_message

# Connect
client.connect( '{}.messaging.internetofthings.ibmcloud.com'.format( 
  config['iot']['organization']
), 1883, 60 )

# Manage client in thread
client.loop_start()

# Track last photo
# Take photo at intervals
# Override same file
last = 0

# Keep running
while True:
  # Current time
  current = time.time()
  
  # Take a picture at specified intervals
  if ( current - last ) > config['camera']['frequency']:
    last = current
    capture()
