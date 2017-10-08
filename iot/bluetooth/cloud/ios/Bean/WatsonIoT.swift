import Foundation

class WatsonIoT {

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
  
  func publish(reading:Reading) {
    
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
  
}

/*
class WatsonIoT:CocoaMQTTDelegate {
  
  // Server
  let clientId = "a:ts200f:" + UUID().uuidString
  let host = "ts200f.messaging.internetofthings.ibmcloud.com"
  let organization = "ts200f"
  let port = 1883
  
  // Access
  let username = "a-ts200f-ztwvifvf9v"
  let password = "4zu+2NSgQhI9M@6*f1"
  let topic = "iot-2/type/Bean/id/Punch/evt/reading/fmt/json"
 
  // var device_token = "y*Q1AXFOMVt5Y8Vg_7"
  
  // Client
  var mqtt:CocoaMQTT?
  
  init(rest:Bool = true) {
    if rest == false {
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
*/
