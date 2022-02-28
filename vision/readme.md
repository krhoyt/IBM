## Computer Vision and Machine Learning in the Browser

The browser, on both the desktop and mobile, are capable of much more than we often give them credit. In this workshop we will push the CPU to 100% as we audit several image processing libraries used for computer vision and machine learning.  
  
Learn computer vision with real-time facial detection, optical character recognition, color distance calculations, object tracking, and even reading barcodes and augmented reality markers. From there we will turn our focus to machine learning where you will learn about developing models for neural networks.

### [Getting Started](1.getting.started)

 - Pieces and parts used by computer vision in the browser
 - Using the web camera stream in a video element
 - Putting video stream onto canvas for pixel access
 - Turning the web camera feed into grayscale using canvas

### [Face Detection and Alignment](2.faces)

- Find faces in a stream using Viola-Jones algorithm
- Determine facial features through constrained local model
- Face detection library that includes rotation of features

### [Optical Character Recognition](3.ocr)

- Crash course on drag and drop operations in the browser
- Perform OCR on dropped content to get only the textual content
- Perform OCR on dropped content to get content and placement
- Adding Watson to speak the results of the OCR operation
- Recognize text from a single frame of a paused video stream

### [Object Detection](4.objects)

- Sample and track a specific color in a video stream
- Smooth color tracking by using averages
- Group tracked colors by proximity to one another
- Comparison of the manual approach to a tracking library
- Apply a gaussian blur to remove image processing artifacts
- Move to a binary image and dilate found edges
- Turn edge pixels into geometric points in space
- Further review contours to approximate polygons
- Isolate rectangles from polygons to narrow down options
- Revisit OCR but only extract paper based on geometry

### [Barcodes](5.barcodes)

- Scan the web camera video stram until a 2D barcode is found
- Scan the web camera video stream until a QR code is found
- Leverage canvas tricks to keep scanning for a barcode
- Integrate a pause between successful barcode scanning operations
- Add support to toggle from 2D barcode to QR code
- Mobile implementation of a barcode and QR code scanner
- Rotation invariant 2D barcode scanning library example
- Standalone QR code scanning library example well suited for Node.js

### [Augmented Reality](6.ar)

- Build a basic 3D scene using Three.js in excruciating detail
- Track a pattern marker with ARToolkit to reveal render area
- Put Three.js and ARToolkit together to put a scene on a marker
- Leverage A-Frame to declaratively render a 3D scene
- Combine AR.js with A-Frame for rapid augmented reality development
- AR.js and A-Frame combination with scene adjusted for mobile viewport

### [Machine Learning](7.ml)

- Drag and drop an image file to see what Watson thinks
- Move the Watson call to async/await for cleaner usage down the road
- Search against a Watson custom classifier first, then the default
- Image classification using TensorFlow against the MobileNet model
- Using TensorFlow against the MobileNet model via library abstraction
- Feature detection using the You Only Look Once model via abstraction
