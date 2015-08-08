package ibm.us.com.picsonamap;

import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.widget.GridView;

import com.badoo.mobile.util.WeakHandler;

import com.ibm.mobile.services.cloudcode.IBMCloudCode;
import com.ibm.mobile.services.core.IBMBluemix;
import com.ibm.mobile.services.data.IBMData;
import com.ibm.mobile.services.data.IBMDataObject;
import com.ibm.mobile.services.data.IBMQuery;

import java.util.ArrayList;
import java.util.List;

import bolts.Continuation;
import bolts.Task;

public class MainActivity extends AppCompatActivity
{
    public final static String CLASS_IMAGE = "Image";
    public final static String KEY_ID = "objectId";
    public final static String KEY_LATITUDE = "latitude";
    public final static String KEY_LONGITUDE = "longitude";
    public final static String KEY_SOURCE = "source";
    public final static String PATH_APPS = "apps";
    public final static String PATH_PUBLIC = "public";
    public final static String PATH_STREAM = "stream";

    private IBMCloudCode            ibmcloud = null;
    private IBMData                 ibmdata = null;

    private WeakHandler             handler = null;

    private ArrayList<StreamItem>   stream = null;
    private GridView                grid = null;
    private StreamAdapter           adapter = null;

    protected void loadStream()
    {
        IBMQuery<IBMDataObject> query;

        // Query images
        query = IBMQuery.queryForClass( CLASS_IMAGE );

        query.find().continueWith( new Continuation<List<IBMDataObject>, Void>() {

            @Override
            public Void then( Task<List<IBMDataObject>> task) throws Exception {
                Bundle              bundle;
                List<IBMDataObject> results;
                Message             message;
                String              source;

                if( task.isFaulted() )
                {
                    Log.i( "MOBILEDATA", "Problem querying image stream." );
                } else {
                    // Get the results
                    results = task.getResult();
                    Log.i( "MOBILEDATA", "Found " + results.size() + " images in the stream." );

                    // Construct messages
                    // Send from data access thread to UI thread
                    for( int i = 0; i < results.size(); i++ )
                    {
                        // Source
                        source =
                            getResources().getString( R.string.bluemix_route ) + "/" +
                            getResources().getString( R.string.bluemix_name ) + "/" +
                            getResources().getString( R.string.bluemix_version ) + "/" +
                            PATH_APPS + "/" +
                            getResources().getString( R.string.bluemix_id ) + "/" +
                            PATH_PUBLIC + "/" +
                            PATH_STREAM + "/" +
                            results.get( i ).getObject( KEY_SOURCE );

                        // Debug
                        Log.i( "MOBILEDATA", source );

                        // Build data to send
                        bundle = new Bundle();
                        bundle.putString( KEY_SOURCE, source );
                        bundle.putString( KEY_ID, results.get( i ).getObjectId() );
                        bundle.putDouble( KEY_LATITUDE, ( Double )results.get( i ).getObject( KEY_LATITUDE ) );
                        bundle.putDouble( KEY_LONGITUDE, ( Double )results.get( i ).getObject( KEY_LONGITUDE ) );

                        // Message wrapper for data
                        message = new Message();
                        message.setData( bundle );

                        // Send message to UI thread
                        handler.sendMessage( message );
                    }
                }

                return null;
            }
        } );
    }

    @Override
    protected void onCreate(Bundle savedInstanceState )
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize Bluemix
        IBMBluemix.initialize(
            this,
            getResources().getString( R.string.bluemix_id ),
            getResources().getString( R.string.bluemix_secret ),
            getResources().getString( R.string.bluemix_route )
        );

        // Initialize Cloud Code
        ibmcloud = IBMCloudCode.initializeService();

        // Initialize Mobile Data
        ibmdata = IBMData.initializeService();

        // Image grid data model
        stream = new ArrayList<>();
        adapter = new StreamAdapter( this, stream );

        // Assign data model to component
        grid = ( GridView )findViewById( R.id.grid_stream );
        grid.setAdapter( adapter );

        // Weak handler implementation
        // https://techblog.badoo.com/blog/2014/08/28/android-handler-memory-leaks
        handler = new WeakHandler( new Handler.Callback() {

            @Override
            public boolean handleMessage( Message message ) {
                Bundle      bundle;
                StreamItem  item;

                // Message data
                bundle = message.getData();

                // Populate item object
                item = new StreamItem();
                item.setId( bundle.getString( KEY_ID ) );
                item.setSource(bundle.getString(KEY_SOURCE));
                item.setLatitude(bundle.getDouble(KEY_LATITUDE));
                item.setLongitude( bundle.getDouble( KEY_LONGITUDE ) );

                Log.i( "MOBILEDATA", bundle.getString( KEY_ID ) );

                // Push into listing
                stream.add( item );

                // Tell adapter to update
                adapter.notifyDataSetChanged();

                return false;
            }

        } );

        // Load recent stream
        loadStream();
    }

}
