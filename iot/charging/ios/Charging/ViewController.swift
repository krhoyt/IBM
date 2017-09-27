import CocoaMQTT
import SwiftyJSON
import UIKit

class ViewController: UIViewController, CocoaMQTTDelegate {

  // Outlets
  @IBOutlet weak var btnCharge: UIButton!
  @IBOutlet weak var lblCharge: UILabel!
  @IBOutlet weak var txtPassword: UITextField!
  @IBOutlet weak var txtUsername: UITextField!
  @IBOutlet weak var vueCharge: UIView!
  @IBOutlet weak var vueLogin: UIView!
  
  // State
  var isCharging:Bool = false;
  var client:String!
  var token:String!
  
  // MQTT
  var watson:CocoaMQTT?
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    // Hide view that shows charging
    // A bit manual, perhaps naive
    vueCharge.isHidden = true
    lblCharge.isHidden = true
    
    // Make sure client ID is unique
    // Supports n-applications across devices
    client = UUID().uuidString.lowercased()
    
    // Connect to Watson IoT
    watson = CocoaMQTT(
      clientID: "a:ts200f:" + client,
      host: "ts200f.messaging.internetofthings.ibmcloud.com",
      port: 1883
    )
    watson?.delegate = self
    watson?.username = "a-ts200f-u91rx19z9o"
    watson?.password = "5vWhBLEx*cR49Z+OEs"
    watson?.connect()
  }

  override func didReceiveMemoryWarning() {
    super.didReceiveMemoryWarning()
  }
  
  /*
   * UI events
   */
  
  @IBAction func doCharge(_ sender: Any) {
    // Default to start
    let body = "{\"token\": \"\(token!)\"}"
    var topic = "iot-2/type/iOS/id/Charger/evt/start/fmt/json"
    
    // Already charging
    // Change topic to stop
    if(isCharging) {
      print("Stop charging.")
      topic = "iot-2/type/iOS/id/Charger/evt/stop/fmt/json"
    } else {
      print("Start charging.")
    }
    
    // Build message
    // Publish to Watson IoT
    let message = CocoaMQTTMessage(
      topic: topic,
      string: body
    )
    watson?.publish(message)
  }

  @IBAction func doLogin(_ sender: Any) {
    print("Login.")
    
    // Not used
    // Connecting as application
    // Device token: sxWcl77jKs+&w!EueR
    
    // TODO: Validate fields
    
    // Build message
    // Publish to Watson IoT
    let message = CocoaMQTTMessage(
      topic: "iot-2/type/iOS/id/Charger/evt/login/fmt/json",
      string: "{" +
        "\"username\": \"" + txtUsername.text! + "\", " +
        "\"password\": \"" + txtPassword.text! + "\"" +
      "}"
    )
    watson?.publish(message)
  }
  
  /*
   * MQTT implementation
   */
  
  func mqtt(_ mqtt: CocoaMQTT, didConnect host: String, port: Int) {
    print("Connected.")
    
    // Subscribe to pertinent topics
    // TODO: Investigate putting action in JSON message
    // TODO: Then you only need one topic
    watson?.subscribe("iot-2/type/iOS/id/Charger/evt/authenticated/fmt/json")
    watson?.subscribe("iot-2/type/iOS/id/Charger/evt/status/fmt/json")
    watson?.subscribe("iot-2/type/iOS/id/Charger/evt/stopped/fmt/json")
  }

  func mqtt(_ mqtt: CocoaMQTT, didConnectAck ack: CocoaMQTTConnAck) {
    print("Connection acknowledged.")
  }
  
  func mqtt(_ mqtt: CocoaMQTT, didPublishMessage message: CocoaMQTTMessage, id: UInt16) {
    print("Published.")
  }

  func mqtt(_ mqtt: CocoaMQTT, didPublishAck id: UInt16) {
    print("Publish acknowledged.")
  }
  
  func mqtt(_ mqtt: CocoaMQTT, didSubscribeTopic topic: String) {
    print("Subscribed.")
  }
  
  func mqtt(_ mqtt: CocoaMQTT, didUnsubscribeTopic topic: String) {
    print("Unsubscribed.")
  }

  func mqtt(_ mqtt: CocoaMQTT, didReceiveMessage message: CocoaMQTTMessage, id: UInt16) {
    // Message for what topic
    switch message.topic {
      
      // Logged in
      case "iot-2/type/iOS/id/Charger/evt/authenticated/fmt/json":
        // Parse JSON
        let body = JSON(data: (message.string?.data(using: .utf8))!)
        
        // Verify success
        if(body["valid"].boolValue) {
          vueLogin.isHidden = true
          vueCharge.isHidden = false
          token = body["token"].stringValue
          print("Logged in: \(token!)")
        } else {
          // Do something else
          // Hey, it's a demo!
        }
        
        break
      
      // Charging status
      case "iot-2/type/iOS/id/Charger/evt/status/fmt/json":
        // Parse JSON
        let body = JSON(data: (message.string?.data(using: .utf8))!)
        
        // Setup view
        if(lblCharge.isHidden) {
          isCharging = true
          lblCharge.text = ""
          lblCharge.isHidden = false
          btnCharge.setTitle("Stop", for: .normal)
        }
        
        // Populate view
        lblCharge.text = String(body["count"].intValue)
        print("Status: \(body["count"].intValue)")
        
        break

      // Stopped
      case "iot-2/type/iOS/id/Charger/evt/stopped/fmt/json":
        // Parse JSON
        let body = JSON(data: (message.string?.data(using: .utf8))!)
        print("Last: \(body["last"].intValue)")
      
        // Reset view
        btnCharge.setTitle("Charge", for: .normal)
        lblCharge.isHidden = true
        isCharging = false
      break
      
      default:
        break
    }
  }
  
  func mqttDidPing(_ mqtt: CocoaMQTT) {
    print("Ping.")
  }

  func mqttDidReceivePong(_ mqtt: CocoaMQTT) {
    print("Pong.")
  }
  
  func mqttDidDisconnect(_ mqtt: CocoaMQTT, withError err: Error?) {
    print("Disconnected.")
  }

}
