package ibm.us.com.picsonamap;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;

import com.squareup.picasso.Picasso;

import java.util.ArrayList;

public class StreamAdapter extends ArrayAdapter<StreamItem>
{

    private ArrayList<StreamItem> stream = null;
    private Context             context = null;

    public StreamAdapter( Context context, ArrayList<StreamItem> stream )
    {
        super( context, R.layout.grid_image, stream );

        this.context = context;
        this.stream = stream;
    }

    @Override
    public View getView( int position, View convert, ViewGroup parent )
    {
        SquaredImageView    image;
        String              url;

        // Reuse view if possible
        if( convert == null )
        {
            image = new SquaredImageView( context );
            image.setScaleType( ImageView.ScaleType.CENTER_CROP );
        } else {
            image = ( SquaredImageView )convert;
        }

        // URL of image for this view
        url = ( (StreamItem )getItem( position ) ).getSource();

        // Asynchronous download
        Picasso.with( context )
               .load( url )
               .fit()
               .tag( context )
               .into(image );

        return image;
    }

}
