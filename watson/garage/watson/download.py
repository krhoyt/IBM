import ibm_boto3
import json
import pathlib

from ibm_botocore.client import Config

# Load configuration
with open( 'config.json' ) as data_file:    
  config = json.load( data_file )

# Instantiate client
# IBM Cloud Object Storage (COS)
# S3 compatible
cos = ibm_boto3.resource(
  's3',
  ibm_api_key_id = config['cos']['api_key'],
  ibm_service_instance_id = config['cos']['instance_id'],
  ibm_auth_endpoint = config['cos']['auth_endpoint'],
  config = Config( signature_version = 'oauth' ),
  endpoint_url = config['cos']['service_endpoint']
)

# For every image in the storage (bucket)
for item in cos.Bucket( config['cos']['bucket'] ).objects.all():
  # Where to put file
  # Specified in configuration
  path = pathlib.Path( '{}/{}'.format( config['path'], item.key ) )

  # Not already downloaded
  if path.exists() == False:
    # Download image file
    cos.Bucket( config['cos']['bucket'] ).download_file( item.key, str( path ) )

    # Show progress    
    print( item.key )
