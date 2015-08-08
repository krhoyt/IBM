Mobile Cloud Services Core JavaScript SDK for IBM Bluemix
===

This package contains the required native components to interact with the IBM
Bluemix Mobile Cloud Services.  This JavaScript SDK can be used for building Web 
or Hybrid applications.  It can also be used inside server-side [Node.js](http://nodejs.org) 
JavaScript modules. The SDK manages all the communication and security integration between 
the client and with the Mobile Cloud Services in Bluemix.

When you use Bluemix to create a Mobile Cloud Starter application, BlueMix provisions 
multiple services under a single application context. Your mobile application is given 
access to the following mobile services: Mobile Application Security, Push, and Mobile Data.

Version: v1.0.0+20140625-1347

##Installation
The SDK may be installed either by downloading a [zip file](https://mbaas-catalog.ng.bluemix.net/sdk/ibm-bluemix-sdk-javascript.zip),
or by installing the desired components using [Bower](http://bower.io), or [NPM](https://www.npmjs.org/).
Using either of these tools can significantly shorten the startup time for new
projects and lessen the burden of managing library version requirements
as well as the dependencies between them.  If you
are using one of our [samples](https://hub.jazz.net/user/mobilecloud),
instructions for using the package manager is included with the documentation.

### Node.js

NPM is included in current node.js distributions.  To install node.js, you may
download the code here: http://nodejs.org/download/.  

Install the `ibmbluemix` package with the [`npm`](https://www.npmjs.org/) package manager , this will require [`node.js`](http://nodejs.org/download/) to be installed first.

Use the following command to install the SDK:

```bash
npm install ibmbluemix
```

### Web or Hybrid

To install Bower, please see the installation section at this link: 
http://bower.io/.  

Using the [`bower`](http://bower.io/) package manager, install the `ibmbluemix` package with the following command:

```
bower install https://hub.jazz.net/git/bluemixmobilesdk/ibmbluemix-javascript/.git
```

###Download

To download a zip of the entire SDK, visit the Mobile Cloud [starter page](https://www.ng.bluemix.net/docs/#starters/mobile/index.html).

###Contents

The complete SDK consists of a core, plus a collection of modules that correspond to function exposed
by the Mobile Cloud Services.  The downloaded zip file
contains all of them. However, each piece of the JavaScript SDK is also available as a separate module
that you can add to your project individually. This allows maximum flexibility, as the developer is able to 
pick and choose the modules required for a given application. 

The JavaScript SDK contains the following components, any of which may be added to your project.

- **[ibmbluemix](https://hub.jazz.net/project/bluemixmobilesdk/ibmbluemix-javascript/overview)** - This is the foundation of the SDK and controls connection and communication with Backend services
- **[ibmpush](https://hub.jazz.net/project/bluemixmobilesdk/ibmpush-javascript/overview)** - This is the service SDK for push notification support
- **[ibmdata](https://hub.jazz.net/project/bluemixmobilesdk/ibmdata-javascript/overview)** - This is the service SDK for cloud data storage
- **[ibmfilesync](https://hub.jazz.net/project/bluemixmobilesdk/ibmfilesync-javascript/overview)** - This is the service SDK for cloud file storage
- **[ibmcloudcode](https://hub.jazz.net/project/bluemixmobilesdk/ibmcloudcode-javascript/overview)** - This is the service SDK for cloud code invocation
- **[ibmlocation](https://hub.jazz.net/project/bluemixmobilesdk/ibmlocation-javascript/overview)** - This is the service SDK for the Beta level mobile location services
- **docs/** - This directory contains the documentation for the SDK

##Getting Started:

Services are associated with a Mobile Cloud application. Connectivity and interaction with
these services depends on the application id, application secret, and application route associated
with a Mobile Cloud Application.

IBMBluemix is the entry point for interacting with the Mobile Cloud Services SDKs.  The method initialize
must be invoked before any other API calls.  IBM Bluemix provides information about the current SDK level
and access to service SDKs.

Below is an example of initializing the Mobile Cloud Services SDK.
```javascript
var config = {
  applicationId:"<ApplicationID>",
  applicationRoute:"<ApplicationRoute>",
  applicationSecret:"<ApplicationSecret>"
};
require(["ibmbluemix","ibmcloudcode"],
    function(ibmbluemix,ibmcloudcode) {
    ibmbluemix.initialize(config);
    var cc = ibmcloudcode.initializeService();
});
```

##Learning More
To learn more about using the SDK, please consult the following resources:
- **[Mobile Cloud Services SDK Developer Guide](http://mbaas-gettingstarted.ng.bluemix.net/)**
- **[Samples and Tutorials](https://www.ng.bluemix.net/docs/#starters/mobile/index.html#samples)**
- Visit the **[Bluemix Developers Community](https://developer.ibm.com/bluemix/)**

Connect with Bluemix: [Twitter](https://twitter.com/ibmbluemix) |
[YouTube](https://www.youtube.com/playlist?list=PLzpeuWUENMK2d3L5qCITo2GQEt-7r0oqm) |
[Blog](https://developer.ibm.com/bluemix/blog/) |
[Facebook](https://www.facebook.com/ibmbluemix) |
[Meetup](http://www.meetup.com/bluemix/)

*Licensed Materials - Property of IBM
(C) Copyright IBM Corp. 2013, |CURRENT_YEAR|. All Rights Reserved.
US Government Users Restricted Rights - Use, duplication or
disclosure restricted by GSA ADP Schedule Contract with IBM Corp.*

[Terms of Use](https://hub.jazz.net/project/bluemixmobilesdk/ibmbluemix-android/overview#https://hub.jazz.net/gerrit/plugins/gerritfs/contents/bluemixmobilesdk%252Fibmbluemix-android/refs%252Fheads%252Fmaster/License.txt) |
[Notices]()
