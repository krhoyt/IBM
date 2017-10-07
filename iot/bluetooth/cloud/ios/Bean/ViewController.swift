import CoreBluetooth
import UIKit

class ViewController: UIViewController, CBCentralManagerDelegate, CBPeripheralDelegate {

  // Cloudant access
  let cloudant = Cloudant()
    
  // Watson IoT access
  let watson = WatsonIoT()
  
  // Beacon constants
  let BEAN_NAME = "Bean"
  let BEAN_SCRATCH_UUID = CBUUID(string: "a495ff21-c5b1-4b44-b512-1370f02d74de")
  let BEAN_SERVICE_UUID = CBUUID(string: "a495ff20-c5b1-4b44-b512-1370f02d74de")
  
  // Beacon management
  var manager:CBCentralManager!
  var peripheral:CBPeripheral!

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
    
    // Beacon manager
    manager = CBCentralManager(delegate: self, queue: nil)
  }

  // Check Bluetooth configuration on the device
  func centralManagerDidUpdateState(_ central:CBCentralManager) {
    
    // Is Bluetooth even on
    if central.state == CBManagerState.poweredOn {
      // Start looking
      central.scanForPeripherals(withServices: nil, options: nil)
      
      // Debug
      debugPrint("Searching ...")
    } else {
      // Bzzt!
      debugPrint("Bluetooth not available.")
    }
  }
  
  // Found a peripheral
  func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
    
    // Device
    let device = (advertisementData as NSDictionary).object(forKey: CBAdvertisementDataLocalNameKey) as? NSString
    
    // Check if this is the device we want
    if device?.contains(BEAN_NAME) == true {
      // Stop looking for devices
      // Track as connected peripheral
      // Setup delegate for events
      self.manager.stopScan()
      self.peripheral = peripheral
      self.peripheral.delegate = self
      
      // Connect to the perhipheral proper
      manager.connect(peripheral, options: nil)
      
      // Debug
      debugPrint("Found Bean.")
    }
  }
  
  // Connected to peripheral
  func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
    // Ask for services
    peripheral.discoverServices(nil)
    
    // Debug
    debugPrint("Getting services ...")
  }
  
  // Discovered peripheral services
  func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
    // Look through the service list
    for service in peripheral.services! {
      let thisService = service as CBService
      
      // If this is the service we want
      if service.uuid == BEAN_SERVICE_UUID {
        // Ask for specific characteristics
        peripheral.discoverCharacteristics(nil, for: thisService)
        
        // Debug
        debugPrint("Using scratch.")
      }
     
      // Debug
      debugPrint("Service: ", service.uuid)
    }
  }
  
  // Discovered peripheral characteristics
  func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) {
    debugPrint("Enabling ...")
    
    // Look at provided characteristics
    for characteristic in service.characteristics! {
      let thisCharacteristic = characteristic as CBCharacteristic
      
      // If this is the characteristic we want
      if thisCharacteristic.uuid == BEAN_SCRATCH_UUID {
        // Start listening for updates
        // Potentially show interface
        self.peripheral.setNotifyValue(true, for: thisCharacteristic)
        
        // Debug
        debugPrint("Set to notify: ", thisCharacteristic.uuid)
      }
      
      // Debug
      debugPrint("Characteristic: ", thisCharacteristic.uuid)
    }
  }
  
  // Data arrived from peripheral
  func peripheral(_ peripheral: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {
    
    // Make sure it is the peripheral we want
    if characteristic.uuid == BEAN_SCRATCH_UUID {
      // Get bytes into string
      // Split by comma
      let content = String(data: characteristic.value!, encoding: String.Encoding.utf8)
      let parts = content!.components(separatedBy: ",")
      
      // Cast values
      let x_axis = Int32((parts[0]))!
      let y_axis = Int32((parts[1]))!
      let z_axis = Int32((parts[2]))!
      var temperature = Int32((parts[3]))!
      
      // Save values in Cloudant
      cloudant.save(
        x_axis: x_axis,
        y_axis: y_axis,
        z_axis: z_axis,
        temperature: temperature,
        raw: content!
      )
      
      // Send values to Watson IoT
      watson.publish(
        x_axis: x_axis,
        y_axis: y_axis,
        z_axis: z_axis,
        temperature: temperature,
        raw: content!
      )
      
      // Populate charts
      view_x.append(reading: x_axis)
      view_y.append(reading: y_axis)
      view_z.append(reading: z_axis)
      
      // Fahrenheit or celcius
      if farenheit {
        let conversion = (Double(temperature) * 1.80) + 32.0
        temperature = Int32(conversion)
      }
      
      // Show temperature
      // Use integer whole number
      lbl_temperature.text = "\(temperature)\u{00B0}"
      
      // Debug
      debugPrint(content!)
    }
  }
  
  // Peripheral disconnected
  // Potentially hide relevant interface
  func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
    debugPrint("Disconnected.")
    
    // Start scanning again
    central.scanForPeripherals(withServices: nil, options: nil)
  }
  
  // Meh
  override func didReceiveMemoryWarning() {
    super.didReceiveMemoryWarning()
  }
  
}
