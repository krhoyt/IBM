// Constants
var PANEL_MIN = 320;
var PANEL_RATIO = 0.66; // 320 / 480    
    
// Load
function doWindowLoad() {
    // Debug
    console.log( 'Window load.' );
    
    // Layout
    doWindowResize();
}
    
// Layout
function doWindowResize() {
    var panels = null;
    var panel_width = null;
    
    // Debug
    console.log( 'Window resize.' );
    
    // Panel sizing
    panel_width = Math.round( window.innerHeight * PANEL_RATIO );
    panel_width = panel_width < PANEL_MIN ? PANEL_MIN : panel_width;
    
    // Place panels
    panels = document.querySelectorAll( '.panel' );
    
    for( var p = 0; p < panels.length; p++ ) {
        panels[p].style.width = panel_width + 'px';
        panels[p].style.height = window.innerHeight + 'px';
        panels[p].style.left = Math.round( ( window.innerWidth - panel_width ) / 2 ) + 'px';
        
        // Rotation
        panels[p].style.webkitTransform =
            'rotate( ' +
            ( p * 20 ) + 'deg' +
            ' )';
    }
}
    
// Go    
window.addEventListener( 'load', doWindowLoad );
window.addEventListener( 'resize', doWindowResize );
