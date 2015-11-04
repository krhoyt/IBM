#Running

There's actually two Android applications.  Using Android Studio, you can "open existing" for both of these, and mostly* be off to the races.  I say mostly as I do not sync credentials to GitHub.  You will need to put in credentials for a known MACM instance.

#Query

The one under the "macm" folder is an application for testing content queries.  This is a good place to start as it is a more simple application.  You run it, press the "+" button on the main screen, and tell it where your content server is at.  It saves that information to disk for later uses.  Then you can select that server, enter some query information, and see the results.  This lets you know if you are connected and working with the content you expect.

#FashionX

Under the "client" folder is the fashion application.  There are a lot of moving pieces in this application, from GPS, to MCA, to MACM, pixel density/resolution management, barcode scanning, and more.  Note that while there are beacon screens, they do not work as we were unable to acquire a modern Android device with BLE support.

#Server

The server folder contains the Node.js assets to deploy to Bluemix.  Again, you will need to provide credentials for the Weather API access.

#Firmware

While the IoT sensor array was dropped from the application in preference for Weather Insights, the "firmware" folder holds all the code for the sensor array.  It posted directly to an IoT Foundation/Node-RED endpoint, which in turn placed the data in a Compose/MongoDB database.

#Assets

The "development" folder is just a scratch folder for keeping graphical assets while working on the application.  Beyond that there is a directory to hold the images for each of the different content types represented in the fashion application.  Most of these images use pictures of my daughter as most fashion photography is heavily copyright

Additionally, there is a "catalog.png" file.  This a fake catalog page I put together.  The QR code at the bottom can be scanned using the Android application, and the result will show you a listing of content from MACM that matches the photos on that page.
