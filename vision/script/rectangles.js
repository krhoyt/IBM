class Rectangles {
  constructor() {}

  // Corners should be (roughly) ninety (90) degrees
  // Exact square is 0, 90, -180, -90
  static angles( polygon ) {
    let corners = [];
    let variations = [0, 90, 180, 90];

    // Get angles
    corners.push( Math.atan2( polygon[1].y - polygon[0].y, polygon[1].x - polygon[0].x ) * ( 180 / Math.PI ) );
    corners.push( Math.atan2( polygon[2].y - polygon[1].y, polygon[2].x - polygon[1].x ) * ( 180 / Math.PI ) );
    corners.push( Math.atan2( polygon[3].y - polygon[2].y, polygon[3].x - polygon[2].x ) * ( 180 / Math.PI ) );        
    corners.push( Math.atan2( polygon[0].y - polygon[3].y, polygon[0].x - polygon[3].x ) * ( 180 / Math.PI ) );    

    // Check if within acceptable range
    for( let c = 0; c < corners.length; c++ ) {
      if( ( Math.abs( corners[c] ) < ( variations[c] - Rectangles.ANGLE_VARIATION ) ) ||
          ( Math.abs( corners[c] ) > ( variations[c] + Rectangles.ANGLE_VARIATION ) ) ) {
        return false;
      }
    }

    // This is a square
    return true;
  }

  // Pythagorean theorum
  // Distance between two points
  static distance( a, b ) {
    return Math.sqrt( Math.pow( b.x - a.x, 2 ) + Math.pow( b.y - a.y, 2 ) );
  }  

  // Look for (roughly) equal side lengths
  static measure( polygon ) {
    let distances = [];

    // Calculate distance for each side
    distances.push( this.distance( polygon[0], polygon[1] ) );
    distances.push( this.distance( polygon[1], polygon[2] ) );
    distances.push( this.distance( polygon[2], polygon[3] ) );    
    distances.push( this.distance( polygon[3], polygon[0] ) );    

    // Find the longest of the sides
    // Apply amount of variation we are willing to tolerate
    let longest = Math.max( distances[0], distances[1], distances[2], distances[3] );
    let cutoff = longest * Rectangles.SIDE_VARIATION;

    // Check measured distances within tolerance      
    for( let d = 0; d < distances.length; d++ ) {
      if( distances[d] < cutoff ) {
        // Not a square
        return false;
      }
    }

    // Appears to be a square
    return true;
  }

  static order( polygon ) {
    // http://webdevzoom.com/get-center-of-polygon-triangle-and-area-using-javascript-and-php/
    let center = polygon.reduce( ( reference, point ) => {
      return {
        x: reference.x + point.x / polygon.length, 
        y: reference.y + point.y / polygon.length
      };
    }, {x: 0, y: 0} );

    // Sort remainder by distance from top-left
    // https://stackoverflow.com/questions/242404/sort-four-points-in-clockwise-order
    polygon = polygon.sort( ( a, b ) => {
      let tana = Math.atan2( ( a.y - center.y ), ( a.x - center.x ) );
      let tanb = Math.atan2( ( b.y - center.y ), ( b.x - center.x ) );
      
      if( tana < tanb ) return -1;
      if( tanb < tana ) return 1;
      return 0;
    } );

    return polygon;
  }  
}

Rectangles.ANGLE_VARIATION = 20;
Rectangles.AREA_MAXIMUM = 0.50;
Rectangles.AREA_MINIMUM = 0.20;
Rectangles.SIDE_VARIATION = 0.60;
