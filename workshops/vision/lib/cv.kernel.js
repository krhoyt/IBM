CV.erode = function(imageSrc, imageDst){
  return CV.applyKernel(imageSrc, imageDst, Math.min);
};

CV.dilate = function(imageSrc, imageDst){
  return CV.applyKernel(imageSrc, imageDst, Math.max);
};
    
CV.applyKernel = function(imageSrc, imageDst, fn){
  var src = imageSrc.data, dst = imageDst.data,
      width = imageSrc.width, height = imageSrc.height,
      offsets = [-width - 1, -width, -width + 1, -1, 1, width - 1, width, width + 1],
      klen = offsets.length,
      pos = 0, value, i, j, k;
  
  for (i = 0; i < width; ++ i){
    dst[pos ++] = 0;
  }

  for (i = 2; i < height; ++ i){
    dst[pos ++] = 0;

    for (j = 2; j < width; ++ j){
      value = src[pos];
      
      for (k = 0; k < klen; ++ k){
        value = fn(value, src[ pos + offsets[k] ] );
      }
      
      dst[pos ++] = value;
    }
    
    dst[pos ++] = 0;
  }

  for (i = 0; i < width; ++ i){
    dst[pos ++] = 0;
  }

  imageDst.width = imageSrc.width;
  imageDst.height = imageSrc.height;
  
  return imageDst;
};
