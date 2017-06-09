package ibm.us.com.toycar;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Handler;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;

import com.esri.android.map.MapView;
import com.pubnub.api.Callback;
import com.pubnub.api.Pubnub;
import com.pubnub.api.PubnubException;

import org.json.JSONException;
import org.json.JSONObject;

import io.realm.Realm;

public class MainActivity extends AppCompatActivity {

    private LocationData        current;
    private LocationListener    monitor;
    private LocationManager     location;
    // private MapView          mapping;
    private Pubnub              pubnub;
    private Realm               realm;
    private RouteData           route;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Data storage
        realm = Realm.getInstance(getApplicationContext());

        // Location
        monitor = new LocationListener() {
            public void onLocationChanged(Location location) {
                Log.d("LOCATION", location.getLatitude() + ", " + location.getLongitude());

                current = new LocationData();
                current.setAccuracy(location.getAccuracy());
                current.setAltitude(location.getAltitude());
                current.setBearing(location.getBearing());
                current.setCreatedAt(System.currentTimeMillis());
                current.setLatitude(location.getLatitude());
                current.setLongitude(location.getLongitude());
                current.setSpeed(location.getSpeed());
            }

            public void onStatusChanged(String provider, int status, Bundle extras) {
                Log.d("LOCATION", "Status changed: " + provider + " (" + status + ")");
            }

            public void onProviderEnabled(String provider) {
                Log.d("LOCATION", "Enabled.");
            }

            public void onProviderDisabled(String provider) {
                Log.d("LOCATION", "Disabled.");
            }
        };

        if(ContextCompat.checkSelfPermission(getApplicationContext(), "android.permission.ACCESS_COARSE_LOCATION") == PackageManager.PERMISSION_GRANTED) {
            Log.d("LOCATION", "Granted.");
        }

        location = (LocationManager) this.getSystemService(Context.LOCATION_SERVICE);
        location.requestLocationUpdates(
            LocationManager.GPS_PROVIDER,
            0,
            0,
            monitor
        );

        // Publish subscribe
        pubnub = new Pubnub(getString(R.string.publish_key), getString(R.string.subscribe_key));

        final Handler h = new Handler();
        h.postDelayed(new Runnable() {
            @Override
            public void run()
            {
                if(current != null) {
                    try {
                        JSONObject json = new JSONObject();
                        json.put("createdAt", current.getCreatedAt());
                        json.put("accuracy", current.getAccuracy());
                        json.put("altitude", current.getAltitude());
                        json.put("bearing", current.getBearing());
                        json.put("latitude", current.getLatitude());
                        json.put("longitude", current.getLongitude());
                        json.put("speed", current.getSpeed());

                        pubnub.publish(
                                getString(R.string.channel),
                                json,
                                new Callback() {
                                    @Override
                                    public void successCallback(String channel, Object message) {
                                        super.successCallback(channel, message);
                                        Log.d("PUBNUB", "Published.");
                                    }
                                }
                        );
                    } catch (JSONException jsone) {
                        jsone.printStackTrace();
                    }
                }

                h.postDelayed(this, 1000);
            }
        }, 1000);
    }
}
