source local.env

~/wsk action create watson/conversation.entities ~/Desktop/intense/assets/entities.js --web true --param WATSON_WORKSPACE "$WATSON_WORKSPACE" --param WATSON_USERNAME "$WATSON_USERNAME" --param WATSON_PASSWORD "$WATSON_PASSWORD"

curl -X "POST" "https://openwhisk.ng.bluemix.net/api/v1/web/krhoyt%40us.ibm.com_dev/watson/conversation.entities" \
    -H "Content-Type: application/json; charset=utf-8" \
    -d $'{
  "message": "I will be home tomorrow."
}'
