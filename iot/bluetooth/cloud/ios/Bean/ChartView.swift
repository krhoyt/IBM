import Foundation
import UIKit

class ChartView: UIView {

  // Constants
  let BLUE_COLOR = UIColor(
    red: 65.0 / 255.0,
    green: 120.0 / 255.0,
    blue: 190.0 / 255.0,
    alpha: 1.0
  )
  
  // History and chart layer
  var history = [Int()]
  var chart = CAShapeLayer()
  
  // Last reading
  let lbl_last = UILabel()
  
  // Init for view subclass
  override func awakeFromNib() {
    super.awakeFromNib()

    // Setup label
    lbl_last.textColor = BLUE_COLOR
    lbl_last.frame = CGRect(
      x: self.bounds.width - 8.0,
      y: 8.0,
      width: 8.0,
      height: 8.0
    )
    self.addSubview(lbl_last)
    
    // Format chart
    chart.strokeColor = BLUE_COLOR.cgColor
    chart.fillColor = UIColor.clear.cgColor
    chart.lineWidth = 6.0
    
    // Add plot layer to view
    self.layer.addSublayer(chart)
    
    // Debug
    debugPrint("Chart setup.")
  }
  
  // Increment history
  func append(reading: Int) {
    // Append
    history.append(reading)
    
    // Limit number of elements
    // Best animation effect
    if history.count > 10 {
      history.remove(at: 0)
    }
    
    // Only render if there is history
    // One reading is not history
    if history.count >= 2 {
      render()
    }
  }
  
  // Linear transform
  // Take a value in one range and respectively place in a second range
  func map( x:Int, in_min:Int, in_max:Int, out_min:Int, out_max:Int ) -> Int {
    return ( x - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
  }
  
  func render() {
    // Assorted measurements
    // Keep chart inside view
    // Padding on top and bottom
    // Number of horizontal stops
    let height = Int(self.bounds.height * 0.90)
    let path = UIBezierPath()
    let remainder = self.bounds.height * 0.05
    let step = self.bounds.width / 9

    // Build chart path
    for r in 0..<history.count {
      // Map acceleromater to view
      let mapped = map(
        x: history[r],
        in_min: -300,
        in_max: 300,
        out_min: 0,
        out_max: height
      )
      
      // Determine coordinate
      let point = CGPoint(
        x: step * CGFloat(r),
        y: CGFloat(Double(mapped)) + remainder
      )

      // Draw segment
      if r == 0 {
        path.move(to: point)
      } else {
        path.addLine(to: point)
      }
    }
    
    // Display chart path
    chart.path = path.cgPath
    
    // Relative vertical position
    // For most recently added value
    let mapped = map(
      x: history[history.count - 1],
      in_min: -300,
      in_max: 300,
      out_min: 0,
      out_max: height
    )

    // Update label contents and sizing
    lbl_last.text = String(history[history.count - 1])
    lbl_last.sizeToFit()
    
    // Determine vertical position of label
    var new_y = lbl_last.frame.origin.y
    
    if (CGFloat(mapped) + remainder) > ((self.bounds.height / 2) + 8.0) {
      new_y = 8.0
    } else if (CGFloat(mapped) + remainder) < ((self.bounds.height / 2) + 8.0) {
      new_y = self.bounds.height - lbl_last.bounds.height - 8.0
    }
    
    // Setup new position for label
    let new_frame = CGRect(
      x: self.bounds.width - lbl_last.bounds.width - 8.0,
      y: new_y,
      width: lbl_last.bounds.width,
      height: lbl_last.bounds.height
    )
    
    // Animate to new position
    UIView.animate(withDuration: 1, delay: 0, options: [.curveEaseOut], animations: {
        self.lbl_last.frame = new_frame
    }, completion: nil)
  }
  
  // Meh
  required init?(coder aDecoder: NSCoder) {
    super.init(coder: aDecoder)
  }
  
}
