// http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function guid( plain ) 
{
    var result = null;
    
    function s4() 
    {
        return Math.floor( ( 1 + Math.random() ) * 0x10000 )
            .toString( 16 )
            .substring( 1 );
    }
    
    if( plain )
    {
        result = 
            s4() + s4() + s4() + s4() + 
            s4() + s4() + s4() + s4();        
    } else {
        result = 
            s4() + s4() + '-' + s4() + 
            '-' + s4() + '-' + s4() + 
            '-' + s4() + s4() + s4();        
    }
    
    return result;
}
