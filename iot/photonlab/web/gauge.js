function Gauge( selector, animate ) {
    var FONT_FAMILY = 'Roboto, sans-serif';
    var FONT_SIZE = 20;    
    var GAUGE_MAXIMUM = 3300;
    var GAUGE_MINIMUM = 0;
    var STEP_SIZE = 45;
    var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';   
    
    var clipping = null;
    var defs = null;
    var element = null;
    var holder = null;
    var position = null;
    var result = null;    
    
    result = {
        value: 0,
        animate: animate,
        container: document.querySelector( selector ),
        document: document.createElementNS( SVG_NAMESPACE, 'svg' )
    };    
    
    result.container.style.height = result.container.clientHeight + "px";
    // result.container.style.left = Math.round( ( window.innerHeight - result.container.clientHeight ) / 2 ) + "px";

    result.document.setAttribute( 'width', result.container.clientWidth );
    result.document.setAttribute( 'height', result.container.clientHeight );
    result.container.appendChild( result.document );    
    
    // Definitions
    defs = document.createElementNS( SVG_NAMESPACE, 'defs' );
    result.document.appendChild( defs );

    // Clipping
    clipping = document.createElementNS( SVG_NAMESPACE, 'clipPath' );
    clipping.setAttribute( 'id', 'gauge' );
    defs.appendChild( clipping );    
    
    element = document.createElementNS( SVG_NAMESPACE, 'rect' );
    element.setAttribute( 'x', 0 );
    element.setAttribute( 'y', 0 );
    element.setAttribute( 'width', result.container.clientWidth );
    element.setAttribute( 'height', result.container.clientHeight );
    element.setAttribute( 'fill', 'red' );
    clipping.appendChild( element );   
    
    // Gauge holder
    holder = document.createElementNS( SVG_NAMESPACE, 'g' );
    // holder.setAttribute( 'transform', 'translate( 2, 27 )' );
    holder.setAttribute( 'clip-path', 'url( #gauge )' );
    result.document.appendChild( holder );

    // Gauge slider
    result.gauge = document.createElementNS( SVG_NAMESPACE, 'g' );
    result.gauge.setAttribute( 'transform', 'translate( 0, 0 )' );
    holder.appendChild( result.gauge );    
    
    // Digits
    position = ( result.container.clientHeight / 2 ) - 27;

    var tickHeight = [50, 30, 35, 30, 40, 30, 35, 30, 40, 30, 35, 30, 40, 30, 35, 30];
    var counter = 0;
    var mark = 0;
    var offset = 0;
    
    for( var digit = 0; digit < GAUGE_MAXIMUM; digit++ )
    {
        if( counter == 0 )
        {
            element = document.createElementNS( SVG_NAMESPACE, 'text' );
            element.textContent = mark;
            element.setAttribute( 'x', offset );
            element.setAttribute( 'y', 33 );
            element.setAttribute( 'fill', 'black' );
            element.setAttribute( 'text-anchor', 'middle' );
            element.setAttribute( 'font-size', FONT_SIZE );
            element.setAttribute( 'font-family', FONT_FAMILY );
            result.gauge.appendChild( element );
            
            mark = mark + 100;
            offset = offset + 144;
            // 144 / 3 = 48 ???
        }        
        
        if( digit % 3 == 0 )
        {
            element = document.createElementNS( SVG_NAMESPACE, 'polyline' );
            element.setAttribute( 'points',
                ( digit * 3 ) + ", " +
                result.container.clientHeight + " " +
                ( digit * 3 ) + ", " +
                ( result.container.clientHeight - tickHeight[counter] )
            );
            element.setAttribute( 'stroke', 'black' );
            result.gauge.appendChild( element );
            
            counter = counter + 1;
            
            if( counter == tickHeight.length ) 
            {
                counter = 0;    
            }
        }
    }    
    
    return result;
};
