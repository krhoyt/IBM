var Field = ( function( element ) {

  // Properties
  var content = null;
  var divider = null;
  var label = null;

  /*
   * Access methods 
   */

  // Get the value from the input field
  // TODO: Deal with empty fields as null
  // TODO: Keep empty fields undefined
  var getValue = function() {
    return content.value.trim();
  };

  // Set the value of the input field
  // Decorate as necessary
  var setValue = function( value ) {
    // Populate
    content.value = value.trim();

    // Decorate
    if( value.trim().length > 0 ) {
      label.classList.add( 'filled' );
    }
  };

  /*
   * Events 
   */

  // Called when input field loses focus
  // Removes decorations as necessary
  // Populated field keeps hint label
  var doBlur = function() {
    // Not selected any longer
    label.classList.remove( 'selected' );
    divider.classList.remove( 'selected' );        

    // Keep hint label if populated
    if( content.value.trim().length > 0 ) {
      label.classList.add( 'filled' );
    } else {
      label.classList.remove( 'filled' );
    }
  };

  // Called when the input field has focus
  // Decorates per Material Design
  var doFocus = function() {
    // Debug
    console.log( 'Field focus.' );

    // Decorate
    label.classList.add( 'selected' );
    divider.classList.add( 'selected' );
  };

  /*
   * Initialize
   */

  // Class name
  console.log( 'Field.' );

  // Decorative elements
  // Roughly per Material Design
  divider = element.querySelector( '.divider' );  
  label = element.querySelector( '.label' );
  
  // Input field
  content = element.querySelector( '.content' );
  content.addEventListener( 'focus', doFocus );
  content.addEventListener( 'blur', doBlur );

  // Reveal
  return {
    getValue: getValue,
    setValue: setValue
  };
	
} );
