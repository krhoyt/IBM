import UIKit

class ViewController: UIViewController, BeanDelegate {

  // Bean access
  let bean = Bean()
  
  // Cloudant access
  let cloudant = Cloudant()
    
  // Watson IoT access
  let watson = WatsonIoT()
  
  // Display mode
  var farenheit = true;
  
  // Chart views
  @IBOutlet weak var view_x: ChartView!
  @IBOutlet weak var view_y: ChartView!
  @IBOutlet weak var view_z: ChartView!
  
  // Temperature display
  @IBOutlet weak var lbl_temperature: UILabel!
  
  // Here we go
  override func viewDidLoad() {
    super.viewDidLoad()
    
    // Listen for readings
    bean.delegate = self
  }

  // Bean received reading
  func didGet(reading: Reading) {
    // Save values in Cloudant
    // Publish values to Watson IoT
    cloudant.save(reading: reading)
    watson.publish(reading: reading)
    
    // Populate charts
    view_x.append(reading: reading.x_axis)
    view_y.append(reading: reading.y_axis)
    view_z.append(reading: reading.z_axis)
    
    // Show temperature
    // Use integer whole number
    // Farenheit or celcius
    if farenheit {
      lbl_temperature.text = "\(Int(reading.farenheit()))\u{00B0}"
    } else {
      lbl_temperature.text = "\(Int(reading.celcius()))\u{00B0}"
    }
  }
  
  // Meh
  override func didReceiveMemoryWarning() {
    super.didReceiveMemoryWarning()
  }
  
}
