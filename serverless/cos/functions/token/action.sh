source ../local.env

ibmcloud fn action create showtell/token index.js \
  --kind nodejs:10 \
  --web true \
  --param WATSON_TTS_KEY "$WATSON_TTS_KEY"