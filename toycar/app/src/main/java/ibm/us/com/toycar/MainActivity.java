package ibm.us.com.toycar;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;

import com.pubnub.api.Callback;
import com.pubnub.api.Pubnub;
import com.pubnub.api.PubnubException;

import io.realm.Realm;

public class MainActivity extends AppCompatActivity {

    private LocationListener    monitor;
    private LocationManager     location;
    private Pubnub              pubnub;
    private Realm               realm;

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

        try {
            pubnub.subscribe(getString(R.string.channel), new Callback() {
                @Override
                public void connectCallback(String channel, Object message) {
                    Log.d("PUBNUB", "Connected.");
                }

                @Override
                public void disconnectCallback(String channel, Object message) {
                    Log.d("PUBNUB", "Disconnected.");
                }

                @Override
                public void reconnectCallback(String channel, Object message) {
                    Log.d("PUBNUB", "Reconnected.");
                }

                @Override
                public void successCallback(String channel, Object message) {
                    Log.d("PUBNUB", "Subscribed.");
                }
            });
        } catch (PubnubException pne) {
            pne.printStackTrace();
        }

        // Bluetooth

    }
}
