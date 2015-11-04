package ibm.us.com.picsonamap;

import android.content.Context;
import android.util.AttributeSet;
import android.widget.ImageView;

// From Picasso samples
// https://github.com/square/picasso/blob/master/picasso-sample/src/main/java/com/example/picasso/SampleGridViewAdapter.java
public class SquaredImageView extends ImageView
{
    public SquaredImageView( Context context )
    {
        super( context );
    }

    public SquaredImageView( Context context, AttributeSet attributes )
    {
        super( context, attributes );
    }

    @Override
    protected void onMeasure( int width, int height )
    {
        super.onMeasure( width, height );
        setMeasuredDimension( getMeasuredWidth(), getMeasuredWidth() );
    }
}
