package com.ibm.us.krhoyt.ridealong;

import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Criteria;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.Handler;
import android.support.design.widget.FloatingActionButton;
import android.support.design.widget.Snackbar;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.View;
import android.view.Menu;
import android.view.MenuItem;

import com.pubnub.api.Callback;
import com.pubnub.api.Pubnub;

import org.json.JSONException;
import org.json.JSONObject;

public class MainActivity extends AppCompatActivity {

    private LocationData        current;
    private LocationListener    monitor;
    private LocationManager     location;
    private Pubnub              pubnub;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        // Action
        FloatingActionButton fab = (FloatingActionButton) findViewById(R.id.fab);
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Snackbar.make(view, "Replace with your own action", Snackbar.LENGTH_LONG)
                        .setAction("Action", null).show();
            }
        });

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

        final Criteria criteria = new Criteria();

        criteria.setAccuracy(Criteria.ACCURACY_FINE);
        criteria.setSpeedRequired(true);
        criteria.setAltitudeRequired(true);
        criteria.setBearingRequired(true);
        criteria.setCostAllowed(false);

        location = (LocationManager) this.getSystemService(Context.LOCATION_SERVICE);
        String provider = location.getBestProvider(criteria, true);
        location.requestLocationUpdates(
            provider,
            0,
            0,
            monitor
        );

        // Publish subscribe
        pubnub = new Pubnub(getString(R.string.publish_key), getString(R.string.subscribe_key));

        final Handler h = new Handler();
        h.postDelayed(new Runnable() {
            @Override
            public void run() {
                if (current != null) {
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

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

}
