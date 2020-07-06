import ibm_boto3
import json
import picamera
import time

from ibm_botocore.client import Config

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

# Upload image to the cloud
def upload():
  # Instantiate client
  cos = ibm_boto3.resource(
    's3',
    ibm_api_key_id = config['cos']['api_key'],
    ibm_service_instance_id = config['cos']['instance_id'],
    ibm_auth_endpoint = config['cos']['auth_endpoint'],
    config = Config( signature_version = 'oauth' ),
    endpoint_url = config['cos']['service_endpoint']
  )
  
  # Name based on current time (milliseconds)
  name = int( round( time.time() * 1000 ) )

  # Print file name to show progress
  print( '{}.jpg'.format( name ) )
  
  # Upload image file to cloud
  cos.Bucket( config['cos']['bucket'] ).upload_file( 
    './{}'.format( config['camera']['photo_name'] ), 
    '{}.jpg'.format( name ) 
  )

# Load configuration
with open( 'config.json' ) as data_file:    
  config = json.load( data_file )

# Current time in milliseconds
start_time = time.time() * 1000

# Do this for one day (24 hours)
# Capture
# Upload
# Sleep
while ( ( time.time() * 1000 ) - start_time ) < 86400000:
  capture()
  upload()
  time.sleep( config['camera']['frequency'] )
