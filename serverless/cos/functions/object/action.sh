source ../local.env

ibmcloud fn action create showtell/object index.js \
  --kind nodejs:10 \
  --web true \
  --param COS_API_KEY "$COS_API_KEY" \
  --param COS_ENDPOINT "$COS_ENDPOINT" \
  --param COS_SERVICE_INSTANCE "$COS_SERVICE_INSTANCE"