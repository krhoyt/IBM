import Foundation
import Kitura
import KituraNet

// Router
let router = Router()

// Static
router.all("/", middleware:StaticFileServer(path: "./public"))

// Translate
// POST
// JSON
router.post("/api/translate") { req, res, next in
  // Get the body data
  let body = try BodyParser.readBodyData(with: req)
    
  // Set headers for JSON
  // Per Watson Translation API
  var headers = [String:String]()
  headers["Accept"] = "application/json"
  headers["Content-Type"] = "application/json"
    
  // Build request options
  var options: [ClientRequest.Options] = []
  options.append(.username("b45daf35-e92c-4837-8304-edc0d8a2b6df"))
  options.append(.password("4fk36cYMBUeL"))
  options.append(.schema("https://"))
  options.append(.method("POST"))
  options.append(.port(443))
  options.append(.hostname("gateway.watsonplatform.net"))
  options.append(.path("/language-translator/api/v2/translate"))
  options.append(.headers(headers))
    
  // Make request
  // Watson Translation
  _ = HTTP.request(options) { response in
    do {
      // Read response
      var data = Data()
      try response?.readAllData(into: &data)
    
      // Make into string
      let body = String.init(data: data, encoding: .utf8)
            
      // Send response
      // JSON
      res.send(body!)
    } catch {
      // Error
    }
  }.end(body)
}

// Server
Kitura.addHTTPServer(onPort: 8080, with: router)
Kitura.run()

// **
// Snippets
// **

// Body to JSON
// let body = try BodyParser.readBodyData(with: req)
// var json = JSON(data: body)
// json["text"].string!

// HTTP Basic Auth
/*
 let user: String = "dc995dc8-7e4e-470b-877c-4bd0e2b6d91f"
 let pass: String = "cBk9KaN9draY"
 let paired: String = String(format: "%@:%@", user, pass)
 let data = paired.data(using: String.Encoding.utf8)!
 let encoded = data.base64EncodedString()
 */
