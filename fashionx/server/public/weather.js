var client;
var config;
var interval;
var positions = [
    {left: 0},
    {left: 224},
    {left: 112, top: 0},
    {left: 112, top: 226},
    {left: 0, top: 0},
    {left: 226, top: 0},
    {left: 226, top: 226},
    {left: 0, top: 226}
];
var xhr;
    
function report() {
    var conditions;
    var data;
    var message;
    
    conditions = document.querySelectorAll( '.condition' );    
    data = {};
    
    for( var c = 0; c < conditions.length; c++ ) {
        data[conditions[c].getAttribute( 'data-name' )] = parseInt( conditions[c].getAttribute( 'data-value' ) );
    }

    console.log( data );
    
    message = new Paho.MQTT.Message( JSON.stringify( {
        d: data     
    } ) );
    message.destinationName = config.topic;
    
    client.send( message );
}    
    
function doClientConnect() {
    console.log( 'MQTT connected.' );
    
    if( interval == null ) {
        interval = setInterval( report, 1000 );        
    }
}
    
function doClientFail() {
    console.log( 'MQTT fail.' );
}    
    
function doConditionClick() {
    var circles;
    var open;
    
    if( this.parentElement.getAttribute( 'data-open' ) == 'yes' ) {
        open = true;
    } else {
        open = false;
    }
    
    circles = this.parentElement.querySelectorAll( 'div:not( .centered )' );
    
    if( open ) {
        for( var c = 0; c < circles.length; c++ ) {
            TweenMax.to( circles[c], 0.60, {left: 112, top: 112} );
            circles[c].removeEventListener( 'click', doOptionClick );
        }
        
        this.parentElement.setAttribute( 'data-open', 'no' );
    } else {
        for( var c = 0; c < circles.length; c++ ) {
            TweenMax.to(circles[c], 0.60, positions[c] );
            circles[c].addEventListener( 'click', doOptionClick );
        }        
        
        this.parentElement.setAttribute( 'data-open', 'yes' );        
    }
}    
    
function doConfigurationLoad() {
    console.log( 'Configuration load.' );
    
    config = JSON.parse( xhr.responseText );
    
    client = new Paho.MQTT.Client(
        config.uri,
        1883,
        config.client
    );
    client.connect( {
        userName: config.userName,
        password: config.password,
        cleanSession: true,
        onSuccess: doClientConnect,
        onFailure: doClientFail
    } );    
}    
    
function doOptionClick() {
    var centered;
    var options;
    var styles;
    
    this.parentElement.setAttribute( 'data-value', this.getAttribute( 'data-value' ) );
    this.parentElement.setAttribute( 'data-open', 'no' );
    
    centered = this.parentElement.querySelector( '.centered' );
    styles = centered.className.split( ' ' );
    centered.classList.remove( styles[styles.length - 1] );
    
    styles = this.className.split( ' ' );
    centered.classList.add( styles[styles.length - 1] );
    
    options = this.parentElement.querySelectorAll( 'div:not( .centered )' );
    
    for( var o = 0; o < options.length; o++ ) {
        TweenMax.to( options[o], 0.60, {left: 112, top: 112} );
    }
}    
    
function doWindowLoad() {
    var circle;
    var conditions;
    
    xhr = new XMLHttpRequest();
    xhr.addEventListener( 'load', doConfigurationLoad );
    xhr.open( 'GET', 'configuration.json', true );
    xhr.send( null );
    
    conditions = document.querySelectorAll( '.condition' );
    
    for( var c = 0; c < conditions.length; c++ ) {
        circle = conditions[c].querySelector( 'div:last-of-type' );
        circle.addEventListener( 'click', doConditionClick );
    }
    
    doWindowResize();
}    
    
function doWindowResize() {
    var holder;
    
    holder = document.querySelector( '.holder' );
    
    if( window.innerHeight <= holder.clientHeight ) {
        holder.style.top = '0';
    } else {
        holder.style.top = Math.round( ( window.innerHeight - holder.clientHeight ) / 2 ) + 'px';            
    }
    
    holder.style.left = Math.round( ( window.innerWidth - holder.clientWidth ) / 2 ) + 'px';
}    
    
window.addEventListener( 'load', doWindowLoad );    
window.addEventListener( 'resize', doWindowResize );
