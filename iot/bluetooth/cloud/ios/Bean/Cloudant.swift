import Foundation

class Cloudant {

  // Connectivity
  var account = "krhoyt"
  
  // Access
  var key = "someredillyouattleadelyh"
  var password = "bd13e57d6908a7378af497026ca31ed507a22edf"
  
  // Routing
  var database = "bean"

  func save(reading:Reading) {
    
    // Authentication
    let user_pass = "\(self.key):\(self.password)".data(using: .utf8)
    let encoded = user_pass!.base64EncodedString(options: Data.Base64EncodingOptions.init(rawValue: 0))
    let authorization = "Basic \(encoded)"

    // Build request
    let url = URL(string: "https://\(account).cloudant.com/\(database)")
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
