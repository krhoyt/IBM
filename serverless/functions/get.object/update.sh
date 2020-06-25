source ../local.env

rm get-object.zip
zip -r get-object.zip *

ibmcloud fn action update cos/get.object get-object.zip \
  --kind nodejs:10 \
  --web true \
  --param COS_ENDPOINT "$COS_ENDPOINT" \
  --param COS_API_KEY "$COS_API_KEY" \
  --param COS_AUTH_ENDPOINT "$COS_AUTH_ENDPOINT" \
  --param COS_SERVICE_INSTANCE "$COS_SERVICE_INSTANCE"