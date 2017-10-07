import Foundation

class Cloudant {

  var account = "krhoyt"
  var database = "bean"
  var key = "someredillyouattleadelyh"
  var password = "bd13e57d6908a7378af497026ca31ed507a22edf"
  
  func save(x_axis:Int32, y_axis:Int32, z_axis:Int32, temperature:Int32, raw:String) {
    // Authentication
    let user_pass = "\(self.key):\(self.password)".data(using: .utf8)
    let encoded = user_pass!.base64EncodedString(options: Data.Base64EncodingOptions.init(rawValue: 0))
    let authorization = "Basic \(encoded)"
    
    // Document data
    let record = [
      "x": x_axis,
      "y": y_axis,
      "z": z_axis,
      "temperature": temperature,
      "raw": raw,
      "created_at": (Date().timeIntervalSince1970 * 1000.0).rounded()
    ] as [String:Any]
    let json = try? JSONSerialization.data(withJSONObject: record, options: .prettyPrinted)
    
    // Build request
    let url = URL(string: "https://\(account).cloudant.com/\(database)")
    var request = URLRequest(url: url!)
    request.httpMethod = "POST"
    request.addValue("application/json", forHTTPHeaderField: "Content-Type")
    request.addValue(authorization, forHTTPHeaderField: "Authorization")
    request.httpBody = json;
    
    // Make request
    // Handle response
    URLSession.shared.dataTask(with: request) { (data, response, error) in
      if error != nil {
        debugPrint(error!)
      } else {
        do {
          let json = try JSONSerialization.jsonObject(with: data!) as! [String:Any]
          print(json["id"]!)
        } catch {
          debugPrint(error)
        }
      }
    }.resume()
  }
  
}
