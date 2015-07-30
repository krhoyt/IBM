package ibm.us.com.weather;

import android.content.res.Resources;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.support.v4.content.res.ResourcesCompat;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.ibm.mobile.services.cloudcode.IBMCloudCode;
import com.ibm.mobile.services.core.IBMBluemix;
import com.ibm.mobile.services.core.http.IBMHttpResponse;
import com.ibm.mobile.services.data.IBMData;
import com.ibm.mobile.services.data.geo.IBMPosition;
import com.ibm.mobile.services.location.IBMLocation;
import com.ibm.mobile.services.location.device.geo.IBMGeoAcquisitionPolicy;

import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.ref.WeakReference;

import bolts.Continuation;
import bolts.Task;

public class MainActivity extends AppCompatActivity {

    // Constants
    public static final String DEGREE = "°";
    public static final String DRAWABLE_ICON = "@drawable/icon_";
    public static final String DRAWABLE_SCENE = "@drawable/scene_";
    public static final String KEY_CITY = "city";
    public static final String KEY_ICON = "icon";
    public static final String KEY_MAXIMUM = "maximum";
    public static final String KEY_MINIMUM = "minimum";
    public static final String KEY_STATE = "state";
    public static final String KEY_SUMMARY = "summary";
    public static final String KEY_TEMPERATURE = "temperature";
    public static final String LATITUDE = "latitude";
    public static final String LONGITUDE = "longitude";
    public static final String WEATHER_ROOT = "/weather";

    // User interface
    protected ImageView     imgCircle = null;
    protected ImageView     imgIcon = null;
    protected ImageView     imgScene = null;
    protected LinearLayout  layConditions = null;
    protected TextView      txtCurrent = null;
    protected TextView      txtLocation = null;
    protected TextView      txtMaximum = null;
    protected TextView      txtMinimum = null;
    protected TextView      txtSummary = null;

    // Async
    private Handler         handler = null;

    // IBM
    private IBMCloudCode    ibmcloud = null;
    private IBMData         ibmdata = null;
    private IBMLocation     ibmlocation = null;

    // Calls Cloud Code
    // Cloud Code uses location to determine weather
    protected void forecast( double latitude, double longitude )
    {
        String  lat;
        String  lng;
        String  url;

        // String representation of coordinates
        lat = Double.toString( latitude );
        lng = Double.toString( longitude );

        // Assemble Cloud Code URL
        url = WEATHER_ROOT + "?" + LATITUDE + "=" + lat + "&" + LONGITUDE + "=" + lng;

        // Call Cloud Code
        // Separate thread
        ibmcloud.get( url ).continueWith( new Continuation<IBMHttpResponse, Void>() {

            @Override
            public Void then( Task<IBMHttpResponse> task ) throws Exception {
                Exception       faulted;
                IBMHttpResponse response;
                String          content;

                // Problem
                if( task.isFaulted() ) {
                    faulted = task.getError();
                    Log.e( "CLOUDCODE", faulted.getMessage() );
                } else {
                    // Get results
                    response = task.getResult();

                    // OK
                    if( response.getHttpResponseCode() == 200 )
                    {
                        // Get String content from response
                        content = stringFromResponse( response.getInputStream() );

                        // Debug
                        Log.i( "CLOUDCODE", content );

                        // Parse resulting JSON
                        parseAndPopulate( content );
                    }
                }

                return null;
            }

        } );
    }

    // Called to parse Cloud Code JSON response
    // Builds message to send back to UI thread
    protected void parseAndPopulate( String content )
    {
        Bundle      bundle;
        JSONObject  results;
        JSONTokener tokens;
        Message     message;

        // Try and parse JSON response
        try {
            // Parse
            tokens = new JSONTokener( content );
            results = new JSONObject( tokens );

            // Debug
            Log.i( "WEATHER", Double.toString( results.getDouble(KEY_TEMPERATURE ) ) );

            // Values to go into user interface
            bundle = new Bundle();
            bundle.putDouble( KEY_TEMPERATURE, results.getDouble( KEY_TEMPERATURE ) );
            bundle.putDouble( KEY_MAXIMUM, results.getDouble( KEY_MAXIMUM ) );
            bundle.putDouble( KEY_MINIMUM, results.getDouble( KEY_MINIMUM ) );
            bundle.putString( KEY_ICON, results.getString( KEY_ICON ) );
            bundle.putString( KEY_SUMMARY, results.getString( KEY_SUMMARY ) );
            bundle.putString( KEY_CITY, results.getString( KEY_CITY ) );
            bundle.putString( KEY_STATE, results.getString( KEY_STATE ) );

            // Passed as message to UI thread
            message = new Message();
            message.setData( bundle );

            // Send values to user interface
            handler.sendMessage( message );
        } catch( JSONException jsone ) {
            jsone.printStackTrace();
        }
    }

    // Called to convert response stream to string
    // May be more efficient means of doing this operation
    public String stringFromResponse( InputStream stream )
    {
        BufferedReader  reader = null;
        String          line;
        StringBuilder   builder = null;

        // Try and read server response
        try {
            // String content
            builder = new StringBuilder();

            // Reader from response stream
            reader = new BufferedReader(
                new InputStreamReader( stream )
            );

            // Build string from stream
            while( ( line = reader.readLine() ) != null )
            {
                builder.append( line );
            }
        } catch( IOException ioe ) {
            ioe.printStackTrace();
        } finally {
            // Cleanup
            if( reader != null )
            {
                try {
                    reader.close();
                } catch( IOException ioe ) {
                    ioe.printStackTrace();
                }
            }
        }

        // Return string representation
        return builder.toString();
    }

    // Android entry point
    // Gets user interface references
    // Start acquiring location
    @Override
    protected void onCreate( Bundle savedInstanceState )
    {
        // Create user interface
        super.onCreate(savedInstanceState);
        setContentView( R.layout.activity_main );

        // User interface component references
        // Used later to fill with data
        layConditions = ( LinearLayout )findViewById( R.id.layout_conditions );
        imgCircle = ( ImageView )findViewById( R.id.image_circle );
        imgScene = ( ImageView )findViewById( R.id.image_scene );
        imgIcon = ( ImageView )findViewById( R.id.image_icon );
        txtCurrent = ( TextView )findViewById( R.id.text_current );
        txtLocation = ( TextView )findViewById( R.id.text_location );
        txtMaximum = ( TextView )findViewById( R.id.text_maximum );
        txtMinimum = ( TextView )findViewById( R.id.text_minimum );
        txtSummary = ( TextView )findViewById( R.id.text_summary );

        // Async against Cloud Code
        handler = new Handler() {

            // Back on UI thread
            @Override
            public void handleMessage( Message message )
            {
                Bundle      bundle;
                Drawable    icon;
                Drawable    scene;
                int         id;
                String      location;
                String      maximum;
                String      minimum;
                String      path;
                String      temperature;

                super.handleMessage( message );

                // Get values
                bundle = message.getData();

                // Assemble image resources for user interface
                // Map to resource identifier
                path = bundle.getString( KEY_ICON );
                path = path.replace("-", "_");
                Log.i( "DRAWABLE", path );

                // Icon
                id = getResources().getIdentifier( DRAWABLE_ICON + path, null, getPackageName() );
                icon = ResourcesCompat.getDrawable(getResources(), id, null);

                // Background scene
                id = getResources().getIdentifier( DRAWABLE_SCENE + path, null, getPackageName() );
                scene = ResourcesCompat.getDrawable( getResources(), id, null );

                // Assemble strings for user interface
                temperature = Long.toString( Math.round( bundle.getDouble( KEY_TEMPERATURE ) ) ) + DEGREE;
                location = bundle.getString(KEY_CITY) + ", " + bundle.getString( KEY_STATE );
                maximum = Long.toString( Math.round( bundle.getDouble( KEY_MAXIMUM ) ) ) + DEGREE;
                minimum = Long.toString( Math.round( bundle.getDouble( KEY_MINIMUM ) ) ) + DEGREE;

                // Populate user interface
                imgIcon.setImageDrawable( icon );
                imgScene.setImageDrawable(scene);
                txtCurrent.setText( temperature );
                txtSummary.setText( bundle.getString( KEY_SUMMARY ) );
                txtMaximum.setText( maximum );
                txtMinimum.setText( minimum );
                txtLocation.setText( location );

                // Reveal user interface
                imgCircle.setVisibility( View.VISIBLE );
                layConditions.setVisibility( View.VISIBLE );
            }

        };

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
        // Used by location service
        // Initialize location service
        ibmdata = IBMData.initializeService();
        ibmlocation = IBMLocation.initializeService();

        // Get location
        IBMLocation.getService().acquireGeoPosition( IBMGeoAcquisitionPolicy.getLiveTrackingProfile() ).continueWith( new Continuation<IBMPosition, Void>() {

            // Async off UI thread
            @Override
            public Void then( Task<IBMPosition> task ) throws Exception {
                Exception   faulted;
                IBMPosition position;

                // Problem
                if( task.isFaulted() )
                {
                    faulted = task.getError();
                    Log.e( "LOCATION", faulted.getMessage() );
                } else {
                    // Get position from results
                    position = task.getResult();

                    // Debug
                    Log.i( "LOCATION", position.getLocation().getLatitude() + ", " + position.getLocation().getLongitude() );

                    // Call Cloud Code
                    forecast(
                        position.getLocation().getLatitude(),
                        position.getLocation().getLongitude()
                    );
                }

                return null;
            }
        } );
    }

}
