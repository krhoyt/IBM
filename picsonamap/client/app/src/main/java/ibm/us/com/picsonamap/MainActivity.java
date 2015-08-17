package ibm.us.com.picsonamap;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.widget.GridView;

import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;

public class MainActivity extends AppCompatActivity
{
    private static final String KEY_DOCUMENTS = "docs";
    private static final String KEY_ID = "_id";
    private static final String KEY_LATITUDE = "latitude";
    private static final String KEY_LONGITUDE = "longitude";
    private static final String SERVICE_ATTACHMENT = "/attachment/";
    private static final String SERVICE_PICTURE = "/picture";
    private static final String SERVICE_ROOT = "https://pics-on-a-map.mybluemix.net/api";

    private ArrayList<StreamItem>   stream = null;
    private GridView                grid = null;
    private StreamAdapter           adapter = null;

    protected void loadStream()
    {
        JsonObjectRequest   request;

        request = new JsonObjectRequest(
            Request.Method.GET,
            SERVICE_ROOT + SERVICE_PICTURE,
            null,
            new Response.Listener<JSONObject>() {
                @Override
                public void onResponse( JSONObject response ) {

                    JSONArray   docs = null;
                    JSONObject  record;
                    StreamItem  item;
                    String      source = null;

                    try {
                        docs = response.getJSONArray( KEY_DOCUMENTS );
                    } catch( JSONException jsone ) {
                        Log.d( "VOLLEY", jsone.getMessage() );
                    }

                    // Iterate latest images
                    // Add to dataset
                    for( int d = 0; d < docs.length(); d++ )
                    {
                        try {
                            record = docs.getJSONObject( d );

                            source = SERVICE_ROOT + SERVICE_ATTACHMENT + record.getString( KEY_ID );

                            // Populate item object
                            item = new StreamItem();
                            item.setId( record.getString( KEY_ID ) );
                            item.setSource( source );
                            item.setLatitude( record.getDouble( KEY_LATITUDE ) );
                            item.setLongitude( record.getDouble( KEY_LONGITUDE ) );

                            stream.add( item );
                        } catch( JSONException jsone ) {
                            Log.d( "VOLLEY", jsone.getMessage() );
                        }

                        // Debug
                        Log.i( "VOLLEY", source );
                    }

                    // Refresh the view
                    adapter.notifyDataSetChanged();
                }
            }, new Response.ErrorListener() {
                @Override
                public void onErrorResponse( VolleyError error ) {
                    Log.d( "VOLLEY", error.getMessage() );
                }
            }
        );

        Volley.newRequestQueue( this ).add( request );
    }

    @Override
    protected void onCreate( Bundle savedInstanceState )
    {
        super.onCreate( savedInstanceState );
        setContentView( R.layout.activity_main );

        // Image grid data model
        stream = new ArrayList<>();
        adapter = new StreamAdapter( this, stream );

        // Assign data model to component
        grid = ( GridView )findViewById( R.id.grid_stream );
        grid.setAdapter( adapter );

        // Load recent stream
        loadStream();
    }

}
