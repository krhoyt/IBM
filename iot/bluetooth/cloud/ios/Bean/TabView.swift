import Foundation
import UIKit

class TabView: UIView {
  
  // Indicator
  let vue_indicator = UIView()
  
  // Init for view subclass
  override func awakeFromNib() {
    super.awakeFromNib()
  
    // Style and position indicator
    vue_indicator.backgroundColor = UIColor.white
    vue_indicator.frame = CGRect(
      x: 0,
      y: 0,
      width: self.frame.width / 3,
      height: 2
    )
    self.addSubview(vue_indicator)
  }
  
  // Change indicator
  func tab(selected:Int) {

    // Setup new position for indicator
    let new_frame = CGRect(
      x: (self.frame.width / 3) * CGFloat(selected),
      y: 0,
      width: self.frame.width / 3,
      height: 2
    )
    
    // Animate to new position
    UIView.animate(withDuration: 0.60, delay: 0, options: [.curveEaseOut], animations: {
      self.vue_indicator.frame = new_frame
    }, completion: nil)
  }
  
  // Meh
  required init?(coder aDecoder: NSCoder) {
    super.init(coder: aDecoder)
  }
  
}
