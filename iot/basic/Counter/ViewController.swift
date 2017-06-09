import UIKit

class ViewController: UIViewController {

    @IBOutlet weak var txtOrganization: UITextField!
    @IBOutlet weak var txtApplication: UITextField!
    @IBOutlet weak var txtKey: UITextField!
    @IBOutlet weak var txtToken: UITextField!
    @IBOutlet weak var txtEvent: UITextField!
    @IBOutlet weak var txtTopic: UITextField!
    @IBOutlet weak var txtMessage: UITextField!
    @IBOutlet weak var txtDeviceType: UITextField!
    @IBOutlet weak var txtDeviceID: UITextField!
    
    var watson:WatsonIoT!
    
    override func viewDidLoad() {
        super.viewDidLoad()
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }

    // Organization: ts200f
    
    // Application ID: Counter
    // Application Key: a-ts200f-u91rx19z9o
    // Application Token: 5vWhBLEx*cR49Z+OEs
    
    // Device Type: iOS
    // Device ID: Kevin
    // Device Token: 76ePHP5GvtcBQ_-rVZ
    
    @IBAction func connect(_ sender: Any) {
        // Watson
        watson = WatsonIoT(
            withClientId: "a:" + txtOrganization.text! + ":" + txtApplication.text!,
            host: txtOrganization.text! + ".messaging.internetofthings.ibmcloud.com",
            port: 1883
        )
        watson.connect(username: txtKey.text!, password: txtToken.text!)
    }

    @IBAction func send(_ sender: Any) {
        watson.publish(
            topic:
                "iot-2/type/" +
                txtDeviceType.text! +
                "/id/" +
                txtDeviceID.text! +
                "/evt/" +
                txtEvent.text! +
                "/fmt/json",
            message: "{\"message\": \"" + txtMessage.text! + "\"}"
        )
    }
    
}

