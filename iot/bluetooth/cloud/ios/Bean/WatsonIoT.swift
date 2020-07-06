import CocoaMQTT
import Foundation

class WatsonIoT: CocoaMQTTDelegate {

  // Connectivity
  let clientId = "a:ts200f:" + UUID().uuidString
  let host = "messaging.internetofthings.ibmcloud.com"
  let organization = "ts200f"
  let port = 8883
  
  // Access
  let username = "a-ts200f-ztwvifvf9v"
  let password = "4zu+2NSgQhI9M@6*f1"

  // Routing
  let device_id = "Punch"
  let device_type = "Bean"
  let event = "reading"
  
  // HTTP or MQTT
  var web = true
  
  // Client
  var watson:CocoaMQTT?
  
  // Default to HTTP
  init(web:Bool = true) {
    self.web = web
    
    // TODO: Publish 8883 with TLS
    
    // Not Web
    // Connect to broker
    // Using MQTT
    if self.web == false {
      watson = CocoaMQTT(
        clientID: clientId,
        host: "\(organization).\(host)",
        // port: UInt16(port)
        port: UInt16(1883)
      )
      watson?.username = username
      watson?.password = password
      watson?.delegate = self;
      watson?.connect()
    }
  }
  
  // Match Cloudant interface
  // Publish in manner initialized
  func save(reading:Reading) {
    if web == true {
      post(reading: reading)
    } else {
      publish(reading: reading)
    }
  }
  
  func post(reading:Reading) {
    
    // Authentication
    let user_pass = "\(self.username):\(self.password)".data(using: .utf8)
    let encoded = user_pass!.base64EncodedString(options: Data.Base64EncodingOptions.init(rawValue: 0))
    let authorization = "Basic \(encoded)"
    
    // Build request
    let url = URL(string:
      "https://\(organization).\(host):\(port)" +
      "/api/v0002/application/" +
      "types/\(device_type)" +
      "/devices/\(device_id)" +
      "/events/\(event)"
    )
    var request = URLRequest(url: url!)
    request.httpMethod = "POST"
    request.addValue("application/json", forHTTPHeaderField: "Content-Type")
    request.addValue(authorization, forHTTPHeaderField: "Authorization")
    request.httpBody = reading.json();
    
    // Make request
    // Handle response
    URLSession.shared.dataTask(with: request) { (data, response, error) in
      if error != nil {
        debugPrint(error!)
      } else {
        // Zero bytes returned
      }
    }.resume()
  }
  
  func publish(reading:Reading) {
    
    // Build MQTT message
    let message = CocoaMQTTMessage(
      topic: "iot-2/type/\(device_type)/id/\(device_id)/evt/\(event)/fmt/json",
      string: String(data: reading.json(), encoding: String.Encoding.utf8)!
    )
    
    // Send
    watson?.publish(message)
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
