import UIKit

class ViewController: UIViewController, BeanDelegate {

  // Reporting mode constants
  let MODE_CLOUDANT = 0
  let MODE_WATSON = 1
  let MODE_BOTH = 2
  
  // Bean access
  let bean = Bean()
  
  // Cloudant access
  let cloudant = Cloudant()
    
  // Watson IoT access
  let watson = WatsonIoT(web: false)
  
  // Last reading
  var last:Reading?
  
  // Display mode
  var fahrenheit = true;
  
  // Reporting mode
  var reporting = 0
  
  // Chart views
  @IBOutlet weak var view_x: ChartView!
  @IBOutlet weak var view_y: ChartView!
  @IBOutlet weak var view_z: ChartView!
  
  // Temperature display
  @IBOutlet weak var lbl_temperature: UILabel!
  
  // Reporting modes
  @IBOutlet weak var btn_cloudant: UIButton!
  @IBOutlet weak var btn_watson: UIButton!
  @IBOutlet weak var btn_both: UIButton!
  
  // Tab indicator for mode
  @IBOutlet weak var vue_tabs: TabView!
  
  // Here we go
  override func viewDidLoad() {
    super.viewDidLoad()
    
    // Clear temperature display
    lbl_temperature.text = ""
    lbl_temperature.isHidden = false
    
    // Default reporting mode
    reporting = MODE_CLOUDANT
    
    // Listen for readings
    bean.delegate = self
  }

  // Bean received reading
  func didGet(reading: Reading) {
    
    // Reference last reading
    last = reading
    
    // Report according to mode
    // Save to Cloudant
    // Publish to Watson IoT
    // Both
    if reporting == MODE_CLOUDANT {
      cloudant.save(reading: reading)
    } else if reporting == MODE_WATSON {
      watson.save(reading: reading)
    } else if reporting == MODE_BOTH {
      cloudant.save(reading: reading)
      watson.save(reading: reading)
    }
    
    // Populate charts
    view_x.append(reading: reading.x_axis)
    view_y.append(reading: reading.y_axis)
    view_z.append(reading: reading.z_axis)
    
    // Display temperature
    temperature()
  }
  
  func temperature() {
    // Show temperature
    // Use integer whole number
    // Fahrenheit or celcius
    if fahrenheit {
      lbl_temperature.text = "\(Int(last!.fahrenheit()))\u{00B0}"
    } else {
      lbl_temperature.text = "\(Int(last!.celcius()))\u{00B0}"
    }
  }
  
  // Toggle temperature reporting
  // Fahrenheit
  // Celcius
  @IBAction func didToggle(_ sender: Any) {
    if fahrenheit {
      fahrenheit = false
    } else {
      fahrenheit = true
    }
    
    // Immediate display
    temperature()
  }
  
  // Change mode to both
  @IBAction func didBoth(_ sender: Any) {
    reporting = MODE_BOTH
    
    // Update styling
    btn_cloudant.alpha = 0.70
    btn_watson.alpha = 0.70
    btn_both.alpha = 1.0
    
    // Move indicator
    vue_tabs.tab(selected: MODE_BOTH)
  }
  
  @IBAction func didCloudant(_ sender: Any) {
    reporting = MODE_CLOUDANT
    
    // Update styling
    btn_cloudant.alpha = 1.0
    btn_watson.alpha = 0.70
    btn_both.alpha = 0.70
    
    // Move indicator
    vue_tabs.tab(selected: MODE_CLOUDANT)
  }
  
  // Change mode to Watson
  @IBAction func didWatson(_ sender: Any) {
    reporting = MODE_WATSON
    
    // Update styling
    btn_cloudant.alpha = 0.70
    btn_watson.alpha = 1.0
    btn_both.alpha = 0.70
    
    // Move indicator
    vue_tabs.tab(selected: MODE_WATSON)
  }
  
  // Meh
  override func didReceiveMemoryWarning() {
    super.didReceiveMemoryWarning()
  }
  
}
