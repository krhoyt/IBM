// WebSocket
var connection = null;
var consumer = null;
var future = null;
var producer = null;
var session = null;
var topic = null;
var socket = null;

// Application
var down = null;
var latitude = null;
var longitude = null;
var map_list = null;
var map_detail = null;
var map_detail_marker = null;
var move = null;
var petrol = null;
var petrol_selection = null;
var queue = null;
var touch = null;

function stationFind( id )
{
    var result = null;

    for( var p = 0; p < petrol.length; p++ )
    {
        if( petrol[p].id == id )
        {
            result = petrol[p];
            break;
        }
    }

    return result;
}

function stationGraphic( station )
{
    var result = null;

    result = ICON_GENERIC;

    // TODO: Put in alphanumeric order
    if( station.toLowerCase().indexOf( STATION_7_ELEVEN ) >= 0 )
    {
        result = ICON_7_ELEVEN;
    } else if( station.toLowerCase().indexOf( STATION_CIRCLE_K ) >= 0 ) {
        result = ICON_CIRCLE_K;
    } else if( station.toLowerCase().indexOf( STATION_CIRCLE_K ) >= 0 ) {
        result = ICON_CIRCLE_K;
    } else if( station.toLowerCase().indexOf( STATION_CONOCO ) >= 0 ) {
        result = ICON_CONOCO;
    } else if( station.toLowerCase().indexOf( STATION_LOAF_N_JUG ) >= 0 ) {
        result = ICON_LOAF_N_JUG;
    } else if( station.toLowerCase().indexOf( STATION_VALERO ) >= 0 ) {
        result = ICON_VALERO;
    } else if( station.toLowerCase().indexOf( STATION_76 ) >= 0 ) {
        result = ICON_76;
    } else if( station.toLowerCase().indexOf( STATION_ARCO ) >= 0 ) {
        result = ICON_ARCO;
    } else if( station.toLowerCase().indexOf( STATION_BP ) >= 0 ) {
        result = ICON_BP;
    } else if( station.toLowerCase().indexOf( STATION_CHEVRON ) >= 0 ) {
        result = ICON_CHEVRON;
    } else if( station.toLowerCase().indexOf( STATION_CITGO ) >= 0 ) {
        result = ICON_CITGO;
    } else if( station.toLowerCase().indexOf( STATION_COSTCO ) >= 0 ) {
        result = ICON_COSTCO;
    } else if( station.toLowerCase().indexOf( STATION_EXXON ) >= 0 ) {
        result = ICON_EXXON;
    } else if( station.toLowerCase().indexOf( STATION_MOBIL ) >= 0 ) {
        result = ICON_MOBIL;
    } else if( station.toLowerCase().indexOf( STATION_SHELL ) >= 0 ) {
        result = ICON_SHELL;
    } else if( station.toLowerCase().indexOf( STATION_TEXACO ) >= 0 ) {
        result = ICON_TEXACO;
    }

    return result;
}

function stationList( json )
{
    var item = null;
    var list = null;
    var locations = null;
    var marker = null;
    var match = null;
    var price = null;
    var station = null;
    var status = null;
    var template = null;

    // Store results
    petrol = json.stations;

    // Display message
    status = document.querySelector( ".splash > p:last-of-type" );
    status.innerHTML = MESSAGE_READY;

    // List
    list = document.querySelector( ".locations > .list" );

    // List line item
    template = document.querySelector( ".item.template" );

    // Show stations
    for( var p = 0; p < petrol.length; p++ )
    {
        // Get matching logo
        match = stationGraphic( petrol[p].station );

        // Station location
        // Big icons for closest
        if( p > MAP_DISPLAY )
        {
            marker = new RichMarker( {
                position: new google.maps.LatLng( petrol[p].lat, petrol[p].lng ),
                map: map_list,
                draggable: false,
                flat: true,
                content: "<div class=\"marker_empty\"></div>"
            } );
        } else {
            marker = new RichMarker( {
                position: new google.maps.LatLng( petrol[p].lat, petrol[p].lng ),
                map: map_list,
                draggable: false,
                flat: true,
                content: "<div class=\"marker\" style=\"background-image: url( '" + match + "' );\"></div>"
            } );
        }

        // Line item
        item = template.cloneNode( true );
        item.setAttribute( "data-id", petrol[p].id );
        item.addEventListener( "click", doStationClick );
        item.classList.remove( "template" );

        // Price and distance
        price = item.querySelector( ".price" );
        price.children[0].innerHTML = "$" + petrol[p].reg_price;
        price.children[1].innerHTML = petrol[p].distance;

        // Location
        station = item.querySelector( ".station" );
        station.children[0].innerHTML = petrol[p].station;
        station.children[1].innerHTML = petrol[p].address;

        list.appendChild( item );
    }

    // Show locations screen
    locations = document.querySelector( ".locations" );
    locations.style.left = window.innerWidth + "px";
    locations.style.display = "inline";
    locations.style.visibility = "visible";

    TweenMax.to( locations, TIMING_SCREEN_MOVE, {
        delay: TIMING_SPLASH_DELAY,
        left: 0
    } );
}

function showPosition( position )
{
    var center_place = null;
    var latlng = null;
    var list = null;
    var locations = null;
    var map_area = null;
    var marker = null;
    var new_place = null;
    var script = null;
    var status = null;

    // Display message
    status = document.querySelector( ".splash > p:last-of-type" );
    status.innerHTML = MESSAGE_STATIONS;

    // Store location
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;

    // For use in Google Maps
    latlng = new google.maps.LatLng( latitude, longitude );

    // Current location
    if( POSITION_OWN == true )
    {
        marker = new google.maps.Marker( {
            position: latlng,
            map: map_list
        } );
    }

    // Center on current location
    // Based on screen placement
    locations = document.querySelector( ".locations" );
    list = document.querySelector( ".locations > .list" );

    map_area = locations.clientHeight - list.clientHeight;
    center_place = locations.clientHeight / 2;
    new_place = center_place - ( map_area / 2 );

    map_list.setCenter( latlng );
    map_list.panBy( 0, new_place );

    // Load station data
    script = document.createElement( "script" );
    script.src =
        PETROL_FEED_URL +
        latitude + "/" +
        longitude + "/" +
        PETROL_FEED_DISTANCE + "/" +
        PETROL_FEED_TYPE + "/" +
        PETROL_FEED_SORT + "/" +
        PETROL_FEED_API_KEY + ".json?callback=" +
        PETROL_FEED_CALLBACK;
    document.getElementsByTagName( "head" )[0].appendChild( script );
}

function doAuthorizationComplete( card )
{
    console.log( "Bouncing ball." );

    // Next screen please
    setTimeout( doPaymentClick, 2000 );
}

function doCardAnimation()
{
    var message = null;
    var top = null;

    console.log( "Checking card animation." );

    top = parseInt( this.style.top.substring( 0, this.style.top.length - 2) );

    if( top < 5 && this.getAttribute( "data-top" ) == "false" )
    {
        console.log( "Telling register to animate card." );

        this.setAttribute( "data-top", "true" );

        // Assemble message
        message = {
            action: "swipe",
            width: this.clientWidth,
            height: this.clientHeight,
            name: this.children[0].innerHTML,
            expires: this.children[1].innerHTML,
            number: this.children[2].innerHTML,
            logo: this.getAttribute( "data-vendor" ),
            background: this.getAttribute( "data-card" )
        };

        // Reached top of this screen
        // Show on register screen
        producer.send(
            session.createTextMessage( JSON.stringify( message ) ),
            doMessageSent
        );
    }
}

function doCardComplete( card, clone, data )
{
    var img = null;

    console.log( "Horizontal gesture complete." );

    // Remove logo image
    card.removeChild( card.children[3] );

    // Kaazing
    img = document.createElement( "img" );
    img.height = 52;
    img.src = "img/kaazing.svg";
    img.classList.add( "kaazing" );
    card.appendChild( img );

    // Remove petrol image
    card.removeChild( card.children[3] );

    // Petrol
    img = document.createElement( "img" );
    img.height = 52;
    img.src = "img/" + data.getAttribute( "data-petrol" ) + ".svg";
    img.classList.add( "petrol" );
    card.appendChild( img );

    // Remove bank image
    card.removeChild( card.children[3] );

    // Petrol
    img = document.createElement( "img" );
    img.height = 52;
    img.src = "img/" + data.getAttribute( "data-bank" ) + ".svg";
    img.classList.add( "bank" );
    card.appendChild( img );

    /*
    clone.style.backgroundImage = "url( 'img/" + page.children[incoming].getAttribute( "data-card" ) + ".png' )";
    clone.children[4].src = "img/" + page.children[incoming].getAttribute( "data-petrol" ) + ".svg";
    clone.children[5].src = "img/" + page.children[incoming].getAttribute( "data-bank" ) + ".svg";
    clone.style.left = window.innerWidth + "px";
    document.body.appendChild( clone );
    */

    // Rebuild logo image
    // SVG placed into SVG scales down
    // Rebuilding from scratch keep scale
    /*
    img = document.createElement( "img" );
    img.width = 52;
    img.height = 52;
    img.src = "https://s3.amazonaws.com/kaazingwallet/img/" + data.getAttribute( "data-vendor" ) + ".svg";
    img.classList.add( "logo" );
    */

    card.style.backgroundImage = "url( 'img/" + data.getAttribute( "data-card" ) + ".png' )";
    card.style.left = Math.round( ( window.innerWidth - card.clientWidth ) / 2 ) + "px";

    document.body.removeChild( clone );

    // Allow preload at register
    // sendCardChange( card, data );
}

function doCardDown( event )
{
    event.preventDefault();

    if( touch )
    {
        down = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
    } else {
        down = {
            x: event.clientX,
            y: event.clientY
        };
    }

    console.log( "Down at: " + down );

    document.addEventListener( touch ? "touchmove" : "mousemove", doCardMove );
    document.addEventListener( touch ? "touchend" : "mouseup", doCardUp );
}

function doCardLeft()
{
    var card = null;
    var clone = null;
    var incoming = null;
    var message = null;
    var page = null;
    var selected = null;

    console.log( "Swipe card left." );

    page = document.querySelector( ".payment .holder" );

    for( var c = 0; c < page.children.length; c++ )
    {
        if( page.children[c].classList.contains( "selected" ) )
        {
            selected = c;
            break;
        }
    }

    if( selected == ( page.children.length - 1 ) )
    {
        incoming = 0;
    } else {
        incoming = selected + 1;
    }

    card = document.querySelector( ".card" );

    clone = card.cloneNode( true );
    clone.style.backgroundImage = "url( 'img/" + page.children[incoming].getAttribute( "data-card" ) + ".png' )";
    clone.children[4].src = "img/" + page.children[incoming].getAttribute( "data-petrol" ) + ".svg";
    clone.children[5].src = "img/" + page.children[incoming].getAttribute( "data-bank" ) + ".svg";
    clone.style.left = window.innerWidth + "px";
    document.body.appendChild( clone );

    page.children[selected].classList.remove( "selected" );
    page.children[incoming].classList.add( "selected" );

    TweenMax.to( card, 0.50, {
        left: 0 - window.innerWidth,
        onComplete: doCardComplete,
        onCompleteParams: [card, clone, page.children[incoming]]
    } );

    TweenMax.to( clone, 0.50, {
        left: Math.round( ( window.innerWidth - card.clientWidth ) / 2 )
    } );
}

function doCardMove( event )
{
    event.preventDefault();

    if( touch )
    {
        move = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
    } else {
        move = {
            x: event.clientX,
            y: event.clientY
        };
    }
}

function doCardRight()
{
    var card = null;
    var clone = null;
    var incoming = null;
    var message = null;
    var page = null;
    var selected = null;

    console.log( "Card swipe right." );

    page = document.querySelector( ".payment > .page > .holder" );

    for( var c = 0; c < page.children.length; c++ )
    {
        if( page.children[c].classList.contains( "selected" ) )
        {
            selected = c;
            break;
        }
    }

    if( selected == 0 )
    {
        incoming = page.children.length - 1;
    } else {
        incoming = selected - 1;
    }

    card = document.querySelector( ".card" );

    clone = card.cloneNode( true );
    clone.style.backgroundImage = "url( 'img/" + page.children[incoming].getAttribute( "data-card" ) + ".png' )";
    clone.children[4].src = "img/" + page.children[incoming].getAttribute( "data-petrol" ) + ".svg";
    clone.children[5].src = "img/" + page.children[incoming].getAttribute( "data-bank" ) + ".svg";
    clone.style.left = ( 0 - window.innerWidth ) + "px";
    document.body.appendChild( clone );

    page.children[selected].classList.remove( "selected" );
    page.children[incoming].classList.add( "selected" );

    TweenMax.to( card, TIMING_SCREEN_MOVE, {
        left: window.innerWidth,
        onComplete: doCardComplete,
        onCompleteParams: [card, clone, page.children[incoming]]
    } );

    TweenMax.to( clone, TIMING_SCREEN_MOVE, {
        left: Math.round( ( window.innerWidth - card.clientWidth ) / 2 )
    } );
}

function doCardUp( event )
{
    var card = null;
    var distance = null;
    var distanceX = null;
    var distanceY = null;
    var status = null;
    var up = null;

    event.preventDefault();

    console.log( "Moved to: " + move );

    distance = Math.sqrt( Math.pow( move.x - down.x, 2 ) + Math.pow( move.y - down.y, 2 ) );

    console.log( "Distance: " + distance );

    if( distance < CLICK_DISTANCE )
    {
        console.log( "Card clicked." );
    } else {
        distanceX = Math.max( down.x, move.x ) - Math.min( down.x, move.x );
        distanceY = Math.max( down.y, move.y ) - Math.min( down.y, move.y );

        if( distanceX > distanceY )
        {
            console.log( "Horizontal swipe." );

            if( down.x < move.x )
            {
                doCardRight();
            } else if( down.x > move.x ) {
                doCardLeft();
            }
        } else if( distanceY > distanceX ) {
            console.log( "Vertical swipe." );

            if( down.y < move.y )
            {
                console.log( "Down" );
            } else if( down.y > move.y ) {
                // Debug
                console.log( "Up" );

                status = document.querySelector( ".payment > .status" );
                status.innerHTML = "AUTHORIZING CARD";

                card = document.querySelector( ".card" );
                card.setAttribute( "data-top", "false" );

                TweenMax.to( card, 1, {
                    top: 0 - card.clientWidth,
                    onUpdate: doCardAnimation,
                    onUpdateScope: card
                } );
            }
        }
    }

    document.removeEventListener( touch ? "touchmove" : "mousemove", doCardMove );
    document.removeEventListener( touch ? "touchend" : "mouseup", doCardUp );

    down = null;
    move = null;
}

function doConnected()
{
    // Connection
    // connection = future.getValue();

    // Start broker session
    // connection.start( doSessionStart );
    
    doSessionStart();
}

function doManualAdvance()
{
    showPosition( {
        coords: {
            latitude: KAAZING_LATITUDE,
            longitude: KAAZING_LONGITUDE
        }
    } );
}

function doMessageArrived( message )
{
    var card = null;
    var data = null;
    var gallons = null;
    var purchase = null;

    console.log( "Message arrived." );

    data = JSON.parse( message.getText() );

    if( data.action == "pump" )
    {
        console.log( "Pumping ..." );

        purchase = document.querySelector( ".fill > p:nth-of-type( 1 )" );
        purchase.innerHTML = data.purchase.toFixed( 2 );

        gallons = document.querySelector( ".fill > p:nth-of-type( 3 )" );
        gallons.innerHTML = data.gallons.toFixed( 2 );
    } else if( data.action == "authorized" ) {
        card = document.querySelector( ".card" );
        card.style.top = window.innerHeight + ( card.clientHeight / 2 ) + "px";

        TweenMax.to( card, 1, {
            top: Math.round( ( ( window.innerHeight - card.clientHeight ) / 2 ) - 15 ),
            onComplete: doAuthorizationComplete,
            onCompleteScope: card
        } );
    }
}

function doMessageSent()
{
    console.log( "Message sent." );
}

function doPaymentClick()
{
    var card = null;
    var fill = null;
    var page = null;

    page = document.querySelector( ".payment > .page > .holder > .indicator.selected" );

    // Tell pump
    producer.send(
        session.createTextMessage( JSON.stringify( {
            action: "payment",
            company: page.getAttribute( "data-company" )
        } ) ),
        doMessageSent
    );

    // Show fill screen
    fill = document.querySelector( ".fill" );
    fill.style.left = window.innerWidth + "px";
    fill.style.visibility = "visible";

    card = document.querySelector( ".card" );

    TweenMax.to( fill, TIMING_SCREEN_MOVE, {
        left: 0
    } );

    TweenMax.to( card, TIMING_SCREEN_MOVE, {
        left: 0 - window.innerWidth
    } );
}

function doPumpChange()
{
    var button = null;

    button = document.querySelector( ".details > .panel > .pump > button" );

    if( this.value.trim().length == 1 )
    {
        button.classList.add( "ready" );
        button.classList.remove( "pending" );
        button.addEventListener( touch ? "touchstart" : "click", doPumpContinue );
    } else {
        button.classList.add( "pending" );
        button.classList.remove( "ready" );
        button.removeEventListener( touch ? "touchstart" : "click", doPumpContinue );
    }
}

function doPumpClear()
{
    var button = null;
    var input = null;

    input = document.querySelector( ".details > .panel > .pump > .code > input" );
    input.value = "";

    button = document.querySelector( ".details > .panel > .pump > button" );
    button.classList.add( "pending" );
    button.classList.remove( "ready" );
    button.removeEventListener( touch ? "touchstart" : "click", doPumpContinue );
}

function doPumpContinue()
{
    var payment = null;
    var pump = null;

    pump = document.querySelector( ".details > .panel > .pump > .code > input" );
    pump.blur();

    topic = session.createTopic( KAAZING_TOPIC + "." + petrol_selection.id + "." + pump.value );

    // Consumer
    // Set listener
    consumer = session.createConsumer( topic );
    consumer.setMessageListener( doMessageArrived );

    // Producer
    producer = session.createProducer( topic );

    producer.send(
        session.createTextMessage( JSON.stringify( {
            action: "handshake"
        } ) ),
        doMessageSent
    );

    // Position card
    var card = document.querySelector( ".card" );
    card.style.left = window.innerWidth + "px";
    card.style.visibility = "visible";

    TweenMax.to( card, TIMING_SCREEN_MOVE, {
        left: Math.round( ( window.innerWidth - card.clientWidth ) / 2 )
    } );

    // Transition to payment method
    payment = document.querySelector( ".payment.screen" );
    payment.style.left = window.innerWidth + "px";
    payment.style.visibility = "visible";

    TweenMax.to( payment, TIMING_SCREEN_MOVE,  {
        left: 0
    } );
}

function doQueueComplete()
{
    console.log( "Card images loaded." );
}

function doQueueProgress( event )
{
    console.log( "Loading cards (" + Math.round( event.progress * 100 ) + "%)." );
}

function doSessionStart()
{
    session = connection.createSession( false, Session.AUTO_ACKNOWLEDGE );
}

function doStationClick()
{
    var center_place = null;
    var details = null;
    var latlng = null;
    var map_area = null;
    var marker = null;
    var match = null;
    var new_place = null;
    var panel = null;
    var prices = null;

    // Clean up
    if( map_detail_marker != null )
    {
        map_detail_marker.setMap( null );
        map_detail_marker = null;
    }

    // Get details
    petrol_selection = stationFind( parseInt( this.getAttribute( "data-id" ) ) );

    // Center on selected location
    // Based on screen placement
    details = document.querySelector( ".details" );
    panel = document.querySelector( ".details > .panel" );

    // Location
    latlng = new google.maps.LatLng( petrol_selection.lat, petrol_selection.lng );

    // Fit in offset viewport
    map_area = details.clientHeight - panel.clientHeight;
    center_place = details.clientHeight / 2;
    new_place = center_place - ( map_area / 2 );

    map_detail.setCenter( latlng );
    map_detail.panBy( 0, new_place );

    // Station logo
    match = stationGraphic( petrol_selection.station );

    // Station location
    marker = new RichMarker( {
        position: latlng,
        map: map_detail,
        draggable: false,
        flat: true,
        content: "<div class=\"marker\" style=\"background-image: url( '" + match + "' );\"></div>"
    } );

    // Name and location
    panel.querySelector( "p:nth-of-type( 1 )").innerHTML = petrol_selection.station;
    panel.querySelector( "p:nth-of-type( 2 )").innerHTML = petrol_selection.address;

    // Prices
    prices = document.querySelector( ".details > .panel > .prices" );
    prices.querySelector( "div:nth-of-type( 1 ) > p" ).innerHTML = "$" + petrol_selection.reg_price;
    prices.querySelector( "div:nth-of-type( 2 ) > p" ).innerHTML = "$" + petrol_selection.mid_price;
    prices.querySelector( "div:nth-of-type( 3 ) > p" ).innerHTML = "$" + petrol_selection.pre_price;

    if( petrol_selection.diesel_price == "N/A" )
    {
        prices.querySelector( "div:nth-of-type( 4 ) > p" ).innerHTML = petrol_selection.diesel_price;
    } else {
        prices.querySelector( "div:nth-of-type( 4 ) > p" ).innerHTML = "$" + petrol_selection.diesel_price;
    }

    details.style.left = window.innerWidth + "px";
    details.style.visibility = "visible";

    TweenMax.to( details, TIMING_SCREEN_MOVE, {
        left: 0
    } );

    history.pushState( {
        id: petrol_selection.id
    }, petrol_selection.station );
}

function doWindowLoad()
{
    var card = null;
    var factory = null;
    var input = null;
    var status = null;
    var screens = null;

    // Preload card images in background
    queue = new createjs.LoadQueue();
    queue.on( "progress", doQueueProgress, this );
    queue.on( "complete", doQueueComplete, this );
    queue.loadManifest( [
        {id: "gold-card", src: "img/gold-card.png"},
        {id: "blue-card", src: "img/blue-card.png"},
        {id: "red-card", src: "img/red-card.png"}
    ] );

    // Gateway
    factory = new JmsConnectionFactory( KAAZING_GATEWAY );

    // Connect to server
    /*
    future = factory.createConnection(
        null,           // User name
        null,           // Password
        doConnected     // Callback
    );
    */
    
    socket = new WebSocket( "ws://" + window.location.host );

    // Touch support
    touch = ( "ontouchstart" in document.documentElement ) ? true : false;

    // Size screens
    screens = document.querySelectorAll( ".screen" );

    for( var s = 0; s < screens.length; s++ )
    {
        screens[s].style.height = window.innerHeight + "px";
        screens[s].style.width = window.innerWidth + "px";

        if( s == 0 )
        {
            screens[s].style.left = "0px";
            screens[s].style.top = "0px";
        } else {
            // screens[s].style.display = "none";
        }
    }

    // Size credit card
    card = document.querySelector( ".card" );
    card.addEventListener( touch ? "touchstart" : "mousedown", doCardDown );
    card.style.width = ( window.innerHeight - ( 75 + 50 ) ) + "px";
    card.style.height = Math.round( ( window.innerHeight - ( 75 + 50 ) ) * CARD_RATIO ) + "px";
    card.style.top = Math.round( ( ( window.innerHeight - card.clientHeight ) / 2 ) - 15 ) + "px";

    // Manually advance
    // Use Kaazing HQ
    status = document.querySelector( ".splash > p:last-of-type" );
    status.addEventListener( touch ? "touchstart" : "click", doManualAdvance );

    // Pump number
    input = document.querySelector( ".details > .panel > .pump > .code > input" );
    input.addEventListener( "keyup", doPumpChange );

    // Payment continue
    // input = document.querySelector( ".payment > button" );
    // input.addEventListener( touch ? "touchstart" : "click", doPaymentClick );

    // Map for list
    map_list = new google.maps.Map(
        document.querySelector( ".locations > .map" ),
        {
            center: {
                lat: KAAZING_LATITUDE,
                lng: KAAZING_LONGITUDE
            },
            mapTypeControl: false,
            streetViewControl: false,
            zoom: 12,
            zoomControl: false
        }
    );

    // Map for details
    map_detail = new google.maps.Map(
        document.querySelector( ".details > .map" ),
        {
            center: {
                lat: KAAZING_LATITUDE,
                lng: KAAZING_LONGITUDE
            },
            mapTypeControl: false,
            streetViewControl: false,
            zoom: 16,
            zoomControl: false
        }
    );

    // Get location
    navigator.geolocation.getCurrentPosition( showPosition );
}

function doWindowState()
{
    var details = null;

    details = document.querySelector( ".details" );

    TweenMax.to( details, TIMING_SCREEN_MOVE, {
        left: window.innerWidth,
        onComplete: doPumpClear
    } );
}

window.addEventListener( "load", doWindowLoad );
window.addEventListener( "popstate", doWindowState );
