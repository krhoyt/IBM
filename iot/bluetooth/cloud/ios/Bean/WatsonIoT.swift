import CocoaMQTT
import Foundation

class WatsonIoT:CocoaMQTTDelegate {
  
  // Server
  let clientId = "a:ts200f:" + UUID().uuidString
  let host = "ts200f.messaging.internetofthings.ibmcloud.com"
  let port = 1883
  
  // Access
  let username = "a-ts200f-ztwvifvf9v"
  let password = "4zu+2NSgQhI9M@6*f1"
  let topic = "iot-2/type/Bean/id/Punch/evt/reading/fmt/json"
  
  // var device_token = "y*Q1AXFOMVt5Y8Vg_7"
  
  // Client
  var mqtt:CocoaMQTT?
  
  init() {
    // Connect
    mqtt = CocoaMQTT(
      clientID: clientId,
      host: host,
      port: UInt16(port)
    )
    mqtt?.username = username
    mqtt?.password = password
    mqtt?.delegate = self;
    mqtt?.connect()
  }
  
  // Publish
  func publish(x_axis:Int32, y_axis:Int32, z_axis:Int32, temperature:Int32, raw:String) {
    // Data to send
    let record = [
      "x_axis": x_axis,
      "y_axis": y_axis,
      "z_axis": z_axis,
      "temperature": temperature,
      "raw": raw,
      "created_at": (Date().timeIntervalSince1970 * 1000.0).rounded()      
    ] as [String:Any]
    
    // As JSON
    let json = try? JSONSerialization.data(withJSONObject: record, options: .prettyPrinted)
    
    // With string in message
    let message = CocoaMQTTMessage(
      topic: topic,
      string: String(data: json!, encoding: String.Encoding.utf8)!
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
