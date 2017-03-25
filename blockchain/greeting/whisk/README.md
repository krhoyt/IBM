source local.env

~/wsk action create blockchain/greeting.query ~/Git/Blockhead/greeting/whisk/greeting.query.js -a web-export true --param BLOCKCHAIN_NAME "$BLOCKCHAIN_NAME" --param BLOCKCHAIN_PEER "$BLOCKCHAIN_PEER" --param BLOCKCHAIN_USER "$BLOCKCHAIN_USER"

https://openwhisk.ng.bluemix.net/api/v1/experimental/web/krhoyt@us.ibm.com_dev/blockchain/greeting.query.json/body

~/wsk action create blockchain/greeting.invoke ~/Git/Blockhead/greeting/whisk/greeting.invoke.js -a web-export true --param BLOCKCHAIN_NAME "$BLOCKCHAIN_NAME" --param BLOCKCHAIN_PEER "$BLOCKCHAIN_PEER" --param BLOCKCHAIN_USER "$BLOCKCHAIN_USER"

https://openwhisk.ng.bluemix.net/api/v1/experimental/web/krhoyt@us.ibm.com_dev/blockchain/greeting.invoke.json/body
