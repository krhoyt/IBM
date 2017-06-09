import CocoaMQTT
import Foundation

class WatsonIoT:CocoaMQTTDelegate {
    
    var mqtt:CocoaMQTT?
    
    init(withClientId clientId:String, host:String, port:NSNumber) {
        mqtt = CocoaMQTT(
            clientID: clientId,
            host: host,
            port: UInt16(port.intValue)
        )
        mqtt?.delegate = self;
    }
    
    // Connect
    func connect(username:String, password:String) {
        mqtt?.username = username
        mqtt?.password = password
        mqtt?.connect()
    }
    
    // Publish
    func publish(topic:String, message:String) {
        let message = CocoaMQTTMessage(
            topic: topic,
            string: message
        )
        
        mqtt?.publish(message)
    }
    
    // Informational messages
    func mqtt(_ mqtt: CocoaMQTT, didConnect host: String, port: Int) {
        print("Connected.")
    }
    
    func mqtt(_ mqtt: CocoaMQTT, didConnectAck ack: CocoaMQTTConnAck) {
        print("Connect acknowledge.")
    }
    
    func mqtt(_ mqtt: CocoaMQTT, didPublishMessage message: CocoaMQTTMessage, id: UInt16) {
        print("Message published.")
    }
    
    func mqtt(_ mqtt: CocoaMQTT, didPublishAck id: UInt16) {
        print("Publish acknowledge.")
    }
    
    // See the raw JSON
    func mqtt(_ mqtt: CocoaMQTT, didReceiveMessage message: CocoaMQTTMessage, id: UInt16) {
        print("Publish: \(message.string!)")
    }
    
    func mqtt(_ mqtt: CocoaMQTT, didSubscribeTopic topic: String) {
        print("Subscribed to topic.")
    }

    func mqtt(_ mqtt: CocoaMQTT, didUnsubscribeTopic topic: String) {
        print("Unsubscribed from topic.")
    }
    
    // Shows keep-alive activity
    func mqttDidPing(_ mqtt: CocoaMQTT) {
        print("Ping.")
    }
    
    func mqttDidReceivePong(_ mqtt: CocoaMQTT) {
        print("Pong.")
    }
    
    func mqttDidDisconnect(_ mqtt: CocoaMQTT, withError err: Error?) {
        print("Disconnect.")
    }
    
}
