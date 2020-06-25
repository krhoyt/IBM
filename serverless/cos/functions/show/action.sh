source ../local.env

zip -r show.zip *

ibmcloud fn action create showtell/show show.zip \
  --kind nodejs:10 \
  --web raw \
  --param COS_ENDPOINT "$COS_ENDPOINT" \
  --param COS_API_KEY "$COS_API_KEY" \
  --param COS_SERVICE_INSTANCE "$COS_SERVICE_INSTANCE"