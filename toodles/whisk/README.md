source local.env

~/wsk action create blockchain/query ~/Git/Blockhead/todo/whisk/command.js -a web-export true --param BLOCKCHAIN_PEER "$BLOCKCHAIN_PEER"

https://openwhisk.ng.bluemix.net/api/v1/experimental/web/krhoyt@us.ibm.com_dev/blockchain/command.json/body

~/wsk action create util/natty ~/Git/Toodles/whisk/natty.js -a web-export true

https://openwhisk.ng.bluemix.net/api/v1/experimental/web/krhoyt@us.ibm.com_dev/util/natty.json/body?value=today
