source local.env
~/wsk action create watson/tts.token ~/Desktop/bean/whisk/tts.token.js -a web-export true --param WATSON_USERNAME "$WATSON_USERNAME" --param WATSON_PASSWORD "$WATSON_PASSWORD" --param WATSON_STREAM "$WATSON_STREAM" --param WATSON_URL "$WATSON_URL"
