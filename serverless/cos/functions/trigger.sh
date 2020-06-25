source local.env

ibmcloud fn trigger create storage \
  --feed /whisk.system/cos-experimental/changes \
  --param apikey "$COS_API_KEY" \
  --param bucket "$COS_BUCKET" \
  --param endpoint "$COS_ENDPOINT"