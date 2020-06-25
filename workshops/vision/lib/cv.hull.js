CV.convexHull = function(points){
  var deque = [], i = 3, point;

  if (points.length >= 3){

    if ( CV.position(points[0], points[1], points[2]) > 0){
      deque.push(points[0]);
      deque.push(points[1]);
    }else{
      deque.push(points[1]);
      deque.push(points[0]);
    }
    deque.push(points[2]);
    deque.unshift(points[2]);

    for (; i < points.length; ++ i){
      point = points[i];

      if ( CV.position(point, deque[0], deque[1]) < 0 ||
           CV.position(deque[deque.length - 2], deque[deque.length - 1], point) < 0 ){
           
        while( CV.position(deque[deque.length - 2], deque[deque.length - 1], point) <= 0 ){
          deque.pop();
        }
        deque.push(point);
        
        while( CV.position(point, deque[0], deque[1]) <= 0 ){
          deque.shift();
        }
        deque.unshift(point);
      }
    }

  }

  return deque;
};

CV.position = function(p1, p2, p3){
  return ( (p2.x - p1.x) * (p3.y - p1.y) ) - ( (p3.x - p1.x) * (p2.y - p1.y) );
};
