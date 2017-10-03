import CoreBluetooth
import UIKit

class ViewController: UIViewController, CBCentralManagerDelegate, CBPeripheralDelegate {

  var manager:CBCentralManager!
  var peripheral:CBPeripheral!
  
  let BEAN_NAME = "Bean+"
  let BEAN_SCRATCH_UUID = CBUUID(string: "a495ff21-c5b1-4b44-b512-1370f02d74de")
  let BEAN_SERVICE_UUID = CBUUID(string: "a495ff20-c5b1-4b44-b512-1370f02d74de")
  
  override func viewDidLoad() {
    super.viewDidLoad()
    manager = CBCentralManager(delegate: self, queue: nil)
  }

  func centralManagerDidUpdateState(_ central:CBCentralManager) {
    if central.state == CBManagerState.poweredOn {
      central.scanForPeripherals(withServices: nil, options: nil)
      debugPrint("Searching ...")
    } else {
      debugPrint("Bluetooth not available.")
    }
  }
  
  func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
    let device = (advertisementData as NSDictionary).object(forKey: CBAdvertisementDataLocalNameKey) as? NSString
    
    if device?.contains(BEAN_NAME) == true {
      debugPrint("Found Bean.")
      
      self.manager.stopScan()
      self.peripheral = peripheral
      self.peripheral.delegate = self
      
      manager.connect(peripheral, options: nil)
    }
  }

  func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
    debugPrint("Getting services ...")
    peripheral.discoverServices(nil)
  }
  
  func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
    for service in peripheral.services! {
      let thisService = service as CBService
      
      debugPrint("Service: ", service.uuid)
      
      if service.uuid == BEAN_SERVICE_UUID {
        debugPrint("Using scratch.")
        peripheral.discoverCharacteristics(nil, for: thisService)
      }
    }
  }
  
  func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) {
    debugPrint("Enabling ...")
    
    for characteristic in service.characteristics! {
      let thisCharacteristic = characteristic as CBCharacteristic
      
      debugPrint("Characteristic: ", thisCharacteristic.uuid)
      
      if thisCharacteristic.uuid == BEAN_SCRATCH_UUID {
        debugPrint("Set to notify: ", thisCharacteristic.uuid)
        
        // lblTemperature.text = "";
        // lblTemperature.isHidden = false;
        
        self.peripheral.setNotifyValue(true, for: thisCharacteristic)
      }
    }
  }
  
  func peripheral(_ peripheral: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {
    if characteristic.uuid == BEAN_SCRATCH_UUID {
      let content = String(data: characteristic.value!, encoding: String.Encoding.utf8)
      let values = content?.components(separatedBy: ",")
      // let temperature = Int(Float(values![0])!)
      _ = Int(values![0])
      
      debugPrint(content!)
      
      // lblTemperature.text = String(temperature)
    }
  }
  
  func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
    debugPrint("Disconnected.")
    
    central.scanForPeripherals(withServices: nil, options: nil)
    
    // lblTemperature.isHidden = true;
  }
  
  override func didReceiveMemoryWarning() {
    super.didReceiveMemoryWarning()
    // Dispose of any resources that can be recreated.
  }
  
}
