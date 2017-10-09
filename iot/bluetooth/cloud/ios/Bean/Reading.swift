import Foundation

class Reading {

  // Properties
  // Includes raw content as string
  // Parsed integer values
  // Epoch time stamp
  var created_at:Double = 0;
  var raw = ""
  var temperature = 0
  var x_axis = 0
  var y_axis = 0
  var z_axis = 0
  
  init(raw:String) {
    
    // Store raw content
    self.raw = raw

    // Split raw content by comma
    let parts = raw.components(separatedBy: ",")

    // Cast values
    x_axis = Int(parts[0])!
    y_axis = Int(parts[1])!
    z_axis = Int(parts[2])!
    temperature = Int(parts[3])!
    
    // Include epoch time stamp
    created_at = (Date().timeIntervalSince1970 * 1000.0).rounded()
  }

  // Already in celcius
  // Complementary for completeness
  func celcius() -> Double {
    return Double(temperature)
  }
  
  // Convert to fahrenheit
  func fahrenheit() -> Double {
    return (Double(temperature) * 1.80) + 32.0
  }
  
  // JSON document version
  // Used for storage
  func json() -> Data {
    // Document data
    let record = [
      "x": x_axis,
      "y": y_axis,
      "z": z_axis,
      "temperature": temperature,
      "raw": raw,
      "created_at": created_at
    ] as [String:Any]
    return try! JSONSerialization.data(withJSONObject: record, options: .prettyPrinted)
  }
  
}
