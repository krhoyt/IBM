# Augmented Reality

Two areas vying for your attention, both as a developer and a consumer, are virtual reality (VR) and augmented reality (AR). Virtual reality is dependent on headsets and focuses on immersing the user into a digital environment. Augment reality by comparison focuses on overlaying digital information onto the physical environment. Currently, most AR applications leverage the camera of a mobile device as a viewport for presenting this information. The concept is that in the not too distant future, that wearable glasses will be able to present this overlay.

> [Magic Leap](https://www.magicleap.com/magic-leap-one) headsets are just starting to become available to consumers after years of hype. [Google Glass](https://www.x.company/glass/) saw some challenging ethical problems surface, but is finding a home in industrial settings.

## Three Dimensions

Presenting 3D content in the browser has been around for a while, and libraries such as ThreeJS have made this task more approachable than ever. Getting started with ThreeJS comes with quite a lot of boilerplate code. The first thing you will need is a place to render the content. ThreeJS is very adaptable, so the content you present can be the entire viewport, or just a smaller section.

    <div class="three"></div>
    this.root = document.querySelector( 'div.three' );

### Scene

In ThreeJS the "scene" is where you place the content you want rendered. You may also want the background to match the background of your web page.

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xffffff );

### Camera

In order to view the scene, you will need a camera. You can think of this as your users view into the 3D world you create. You can move the camera around the scene programmatically, or via mouse controls. You can also control where it is the camera is looking. In this case we will position the back from the center of the scene, which is represented in 3D space as "0, 0, 0". We will then tilt the camera slightly to look back towards the center point.

    this.camera = new THREE.PerspectiveCamera(
      45,
      this.root.clientWidth / this.root.clientHeight,
      0.1,
      1000
    );
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 150;
    this.camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

### Renderer

The renderer is where the work of putting something onto the screen takes place. You can size it for a small section of the web page, but for this application we will take up the entire viewport.

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize( this.root.clientWidth, this.root.clientHeight );
    this.renderer.shadowMap.enabled = true;

### Lighting

Without any lighting the scene will currently render as black. In 3D there are various forms of lighting. In this application we will add a "SpotLight" to point at the center point. Much like the camera, you can programmatically control the position of the light within the scene, and you can also control where it is pointed (in the case of a spotlight).

    let light = new THREE.SpotLight( 0xFFFFFF );
    light.position.set( 0, 0, 150 );
    this.scene.add( light );

Putting this altogether will give you a complete, yet empty scene.

    this.root.appendChild( this.renderer.domElement );

### External Model

ThreeJS gives you a variety of 3D "primitives" that you can use to build whatever you want. In many cases however, it is likely that you will have a 3D model from some other tooling. If you are new to creating 3D models, I am a big fan of [Autodesk Tinkercad](https://www.tinkercad.com/). Tinkercad will allow you export models in a variety of formats. The preferred format for ThreeJS is "OBJ". You will also get a "material" file (MTL) when you export from Tinkercad. This contains information about how the object should be colored, reflect light, etc.

In order to import an external model into our ThreeJS scene, we will first need to load the material. Then we can load the object and apply the loaded material onto the object. From there we can scale the object and add it to the scene. The default placement for the object will be at the center of the scene.

    let materials = new THREE.MTLLoader();
    materials.load( '../assets/ibm.mtl', ( materials ) => {
      materials.preload();
      
      let object = new THREE.OBJLoader();
      object.setMaterials( materials );
      object.load( '../assets/ibm.obj', ( mesh ) => {
        this.logo = mesh;
        this.logo.scale.set( 0.6, 0.6, 0.6 );
        
        this.scene.add( this.logo );
        
        this.render();
      } );
    } );

### Putting Things in Motion

Moving an object in the scene (or camera, or light) requires that you tell ThreeJS to render the scene again before it will be displayed on the screen. This is an ideal use for "requestAnimationFrame()". Move something. Render something. If we monitor the timing, it also gives us an ideal place to fine tune how the movement occurs. For this we will lean on the "performance.now()" method we discussed earlier in the workshop.

    render() {
      let now = performance.now();
      
      if( ( now - this.time ) > Three.ROTATION_RATE ) {
        this.time = now;
        
        if( this.rotation === 360 ) {
          this.rotation = 1;
        } else {
          this.rotation = this.rotation + 1;
        }
      }
      
      this.logo.rotation.y = this.rotation * ( Math.PI / 180 );
      this.renderer.render( this.scene, this.camera );
      
      requestAnimationFrame( this.render.bind( this ) );
    }

On entering the "render()" function we take note of the current system time in milliseconds. If enough time has passed that we want to take the next step in our movement, we rotate the object. While you can continue to rotate past 360 degrees, I like to keep within the bounds. Rotation take the form of a property on the object you want to rotate. Then we tell ThreeJS to render the scene. Then we ask the browser for a repaint. If we do this repeatedly, the object will appear to spin around its own center point.

## Making Your Mark

Much as ThreeJS has become the default 3D library of the web, [ARToolkit](https://github.com/artoolkit/jsartoolkit5) is the default for augmented reality. ARToolkit is just as low-level as ThreeJS (and in fact requires ThreeJS). It gives you the hooks for the various features you will need to work in augmented reality, but expects you to tie everything together for your specific need.

The first thing you will need to know when it comes to rendering an augmented reality scene is where to actually place what it is that you want to render. These are still early days in AR. Apple's ARKit will look at the image presented through the camera, and approximate surfaces. We are not quite there with the Web, but the [WebXR](https://github.com/immersive-web/webxr) specifications are evolving rapidly. In the meantime, we will need to know where to place our information. An ideal means of doing this is with a physical marker.

> First there was virtual reality (VR). Then there was augmented reality (AR). This morphed into mixed reality (MR). All of which use similar toolsets and APIs. For this reason you will see "XR" used when referring to the "reality" space in general.

There are a variety of marker formats. These markers look like QR codes at first glance, and the concept is the same. They yield strong characteristics for which object detection algorithms can be applied. For this example we will use a [Hiro](https://daqri.com/) marker format. This format presents a thick rectangular border around some given shape. The contained shape can be used to tell ARToolkit what specific content should be rendered for this specific marker.

> Generating a marker is beyond the scope of this workshop. For Hiro markers, there is a nice [online tool](https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html) provided by [Jerome Etienne](https://twitter.com/jerome_etienne), the author of [ARjs](https://github.com/jeromeetienne/AR.js), which we will come to in a moment. 

### Camera

Using an ARToolkit camera is almost identical to the way we have been using WebRTC to put a web camera stream into a video element. There is an additional step in that the "ARCameraParam" class will load an external data file. This file is where we can specify the lens distortion and other artifacts that we may want to know about when rendering AR content. There is a default file provided by ARToolkit which works for most configurations.

First, we instantiate an "ARCameraParam" object. Before telling it where the data file is located, we add hooks for what to do once that file is loaded. For our purposes, this is where we will start the web camera and put it into the video element. With our hooks in place, we then load the data file.

    this.camera = new ARCameraParam();
    this.camera.onload = () => {
      navigator.mediaDevices.getUserMedia( {audio:  false, video:  true} )
      .then( ( stream ) => {
        this.video.srcObject = stream;
        this.video.play();
      } )
      .catch( ( error ) => {
        console.log( error );
      } );
    };
    
    this.camera.src = Augmented.CAMERA;

### Controller

The size of the video element is particularly important in getting everything lined up correctly when rendering. This is not a problem we have had to deal with before now. The video element emits a "loadedmetadata" event when the video has started playing. We do not want to instantiate our AR controller until the video has started playing, so we will want to register for that event.

    this.video = document.querySelector( 'video' );
    this.video.addEventListener( 'loadedmetadata', ( evt ) =>  this.doVideoLoad( evt ) );
    
    doVideoLoad( evt ) {
      this.ar = new ARController( this.video, this.camera );
      this.ar.setPatternDetectionMode( artoolkit.AR_MATRIX_CODE_DETECTION );
      this.ar.addEventListener( 'getMarker', ( evt ) =>  this.doMarker( evt ) );
      this.ar.loadMarker( '../assets/hdc.marker.patt', ( evt ) => {
        this.detect();
        console.log( 'Marker: ' + evt );
      } );
    }
    
    doMarker( evt ) {
      this.marker = evt.data.marker;
      console.log( evt );
    }

With the video loaded and playing, we can start getting deeper into our AR work. An "ARController" instance is used by ARToolkit to orchestrate the viewport. It takes a reference to the video element, and the camera definition we previously created. Next we tell the controller what marker it should try to find. When it finds a marker, the "getMarker" event will be emitted. This event will contain location information for further rendering. We will want to keep a reference to the marker locatin around for rendering. Finally, we load the marker. When the marker is loaded, we can start our detection process.

### Detection

Much as ThreeJS used the "requestAnimationFrame()" method to render content, ARToolkit uses this as a chance to look for a marker. If no marker is found, then we do not want to display anything. If the marker is found, then we want to draw it onto the canvas. The marker will not be a perfect rectangle as it may be tilted, so we draw the individual lines using the "context" of the canvas element.

    detect() {
      this.ar.process();
      
      this.context.clearRect( 0, 0, this.canvas.clientWidth, this.canvas.clientHeight );
      
      if( this.marker ) {
        this.context.beginPath();
        this.context.strokeStyle = 'red';
        this.context.lineWidth = 3;
        this.context.moveTo( this.marker.vertex[0][0], this.marker.vertex[0][1] );
        this.context.lineTo( this.marker.vertex[1][0], this.marker.vertex[1][1] );
        this.context.lineTo( this.marker.vertex[2][0], this.marker.vertex[2][1] );
        this.context.lineTo( this.marker.vertex[3][0], this.marker.vertex[3][1] );
        this.context.lineTo( this.marker.vertex[0][0], this.marker.vertex[0][1] );
        this.context.stroke();
        
        this.marker = null;
      }
      
      requestAnimationFrame( () => { return  this.detect(); } );
    }

## Web Components

One of my favorite emerging Web standards is Web Components. Web Components is actually a set of specifications rolled together to bring robust components to the Web. These individual specifications includes Custom Elements, Shadow DOM, HTML Imports, and HTML Templates. Not all of these are implemented fully across browsers, but there are [polyfills](https://www.webcomponents.org/polyfills) available. 

Web Components are available for many different behaviors including everything from various inputs to state management. The most robust library of components available today is [Polymer](https://www.polymer-project.org/). The excellent folks at Mozilla have wrapped much of ThreeJS into a component set making it substantially easier to work with than the low-level JavaScript method we have used thusfar. This project is called "[A-Frame](https://aframe.io/)".

A-Frame will allow us to create a ThreeJS scene, including a custom model, using only HTML tags.

    <a-scene embedded vr-mode-ui="enabled: false">
      <a-assets>
        <a-asset-item id="logo" src="../assets/ibm.obj"></a-asset-item>
        <a-asset-item id="material" src="../assets/ibm.mtl"></a-asset-item>
      </a-assets>
      <a-entity>
        <a-entity 
          obj-model="obj: #logo; mtl: #material"  
          scale="0.035 0.035 0.035"  
          position="0 2 -4"></a-entity>
      </a-entity>
    </a-scene>

Our scene is established using an "a-scene" element. We want to use a custom model with its own material which are considered assets to A-Frame. Then there is the entity to render. You can nest entity elements as needed depending on the effect you desire. On the "a-entity" element we specify the model and material, the scale, and the position of the object. That's it! Now we have a 3D scene using ThreeJS.

## :star: AR.js

What would be really great is if somebody would extend A-Frame with ARToolkit, allowing us to have complete agemented reality in only a handful of lines of HTML. This is exactly what AR.js brings to the table.

### Scene Redux

To put our scene in place we use the "a-scene" element from A-Frame, but then add some extra information around our AR specifics. The "arjs" attribute tells ARToolkit that we do not want debugging (in this case), and that we will be using a web camera as the video source. Importing our model and material remains the same.

    <a-scene  
      embedded  
      arjs="debugUIEnabled: false; sourceType: webcam;"  
      vr-mode-ui="enabled: false">
      
      <a-assets>
        <a-asset-item id="logo" src="../assets/ibm.obj"></a-asset-item>
        <a-asset-item id="material" src="../assets/ibm.mtl"></a-asset-item>
      </a-assets>
      
      <!-- Moar content -->
      
    </a-scene>

### Marker Redux

The "a-marker" element tells ARToolkit what marker pattern to look for, and what content we want to place on that marker. The content defined in the "a-entity" element remains the same as our previous example save a few extra details about placement. We will also add an "a-animation" element to enable a rotating animation . on the entity.

    <a-marker preset="custom" type="pattern" url="../assets/hdc.marker.patt">
      <a-entity>
        <a-entity  
          obj-model="obj: #logo; mtl: #material"  
          scale="0.015 0.015 0.015"  
          rotation="270 0 0"></a-entity>
          
        <a-animation  
          attribute="rotation"  
          dur="5000"  
          fill="forwards"  
          to="0 0 360"  
          repeat="indefinite"  
          easing="linear"></a-animation>
      </a-entity>
    </a-marker>

### Camera Redux

Last but not least, we need a camera through which to view our content. This takes the form of another "a-entity" and specifies "camera" as an attribute.

    <a-entity  camera></a-entity>

In less than fifteen (15) lines of HTML we now have our very own augmented reality implementation. From here, the sky is the limit.

## Going Mobile

Of course you are not going to be carrying your laptop around to look at augmented reality scenes. You are more likely to have your smartphone hanging out in your pocket (or glued to your hand, whatever). The implementation is exactly the same with just a few tweaks to the object model placement for the purposes of the mobile device screen.

