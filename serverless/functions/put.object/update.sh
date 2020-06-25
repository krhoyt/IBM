source ../local.env

rm put-object.zip
zip -r put-object.zip *

ibmcloud fn action update cos/put.object put-object.zip \
  --kind nodejs:10 \
  --web raw \
  --param COS_ENDPOINT "$COS_ENDPOINT" \
  --param COS_API_KEY "$COS_API_KEY" \
  --param COS_AUTH_ENDPOINT "$COS_AUTH_ENDPOINT" \
  --param COS_SERVICE_INSTANCE "$COS_SERVICE_INSTANCE"