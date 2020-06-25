jsfeat.imgproc.erode = function(imageSrc, imageDst){
  return jsfeat.imgproc.applyKernel(imageSrc, imageDst, Math.min);
};

jsfeat.imgproc.dilate = function(imageSrc, imageDst){
  return jsfeat.imgproc.applyKernel(imageSrc, imageDst, Math.max);
};

jsfeat.imgproc.applyKernel = function( src, dst, fn ) {
  if( src && src.type&jsfeat.U8_t && dst && dst.type&jsfeat.U8_t ) {
    var src_d, dst_d = dst.data, tmp_buff,
    width = src.cols, height = src.rows,
    offsets = [-width - 1, -width, -width + 1, -1, 1, width - 1, width, width + 1],
    klen = offsets.length,
    pos = 0, value, i, j, k;
                
    if( src === dst ) {
      tmp_buff = jsfeat.cache.get_buffer( width * height );
      src.copy_to( tmp_buff );
      src_d = tmp_buff.data;
    } else {
      src_d = src.data;
    }
                
    for( i = 0; i < width; ++ i ) {
      dst_d[pos ++] = 0;
    }

    for( i = 2; i < height; ++ i ) {
      dst_d[pos ++] = 0;

      for( j = 2; j < width; ++ j ) {
        value = src_d[pos];

        value = fn(value, src_d[ pos + offsets[0] ]);
        value = fn(value, src_d[ pos + offsets[1] ]);
        value = fn(value, src_d[ pos + offsets[2] ]);
        value = fn(value, src_d[ pos + offsets[3] ]);
        value = fn(value, src_d[ pos + offsets[4] ]);
        value = fn(value, src_d[ pos + offsets[5] ]);
        value = fn(value, src_d[ pos + offsets[6] ]);
        value = fn(value, src_d[ pos + offsets[7] ]);

        dst_d[pos ++] = value;
      }

      dst_d[pos ++] = 0;
    }

    for( i = 0; i < width; ++ i ) {
      dst_d[pos ++] = 0;
    }
                
    if( src === dst ) {
      jsfeat.cache.put_buffer( tmp_buff );
    }
  }
};
