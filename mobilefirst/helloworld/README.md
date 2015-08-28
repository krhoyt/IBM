#MobileFirst

What follows is a list of commands used to create and deploy the various MobileFirst assets.  They are not all inclusive, and should be considered before use.

```
// Server resources
mfp create HelloProject

// Change into project folder
// Add an adapter
// Start server (if not already)
// Push the changes
cd HelloProject
mfp add adapter HelloAdapter —type java —package com.ibm.us.krhoyt
mfp start
mfp push

// Test adapter (if desired)
mfp adapter call HelloAdapter/hello/Kevin

// New Android Studio project
// Do not use same directory as server resources
// Project -> Gradle -> build.gradle (Module: app)
// Below "apply plugin: ‘com.android.application’"
repositories {
  jcenter()
}

// Inside “android"
packagingOptions {
  pickFirst 'META-INF/ASL2.0'
  pickFirst 'META-INF/LICENSE'
  pickFirst 'META-INF/NOTICE'
}

// Inside “dependencies"
compile group: 'com.ibm.mobile.foundation',
  name: 'ibmmobilefirstplatformfoundation',
  version: '7.1.0.0',
  ext: 'aar',
  transitive: true

// AndroidManifest.xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/>
<uses-permission android:name="android.permission.REAL_GET_TASKS" />

// Additional activity
<activity android:name="com.worklight.wlclient.ui.UIActivity" />

// Back at the command prompt
// Change to the Android Studio project folder
// Push application description to server
cd ../HelloAndroid
mfp push

// Example invoke of server resource
private WLClient     client;
...
// Inside onCreate
client = WLClient.createInstance(this);

client.connect(new WLResponseListener() {
  @Override
  public void onSuccess(WLResponse response) {
    URI                                 path;                    
    WLResourceRequest     request;

    try {
      path = new URI(SERVICE + parameter);
      request = new WLResourceRequest(path, WLResourceRequest.GET);
      request.send(new WLResponseListener() {
        @Override
        public void onSuccess(WLResponse response) {
          Log.d(“MOBILEFIRST”, “Success: “ + response.getResponseText());
        }

        @Override
        public void onFailure(WLFailResponse response) {
          Log.d(“MOBILEFIRST”, “Fail: “ + response.getErrorMsg());
        }
      });
    } catch(URISyntaxException urise) {
      Log.d(“MOBILEFIRST”, “URI: “ + urise.getMessage());
    }
  }
});
```
