package com.ibm.us.krhoyt.ridealong;

import android.os.Handler;
import android.os.Message;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;

import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.badoo.mobile.util.WeakHandler;
import com.ibm.watson.developer_cloud.android.text_to_speech.v1.TextToSpeech;
import com.pubnub.api.Callback;
import com.pubnub.api.Pubnub;
import com.pubnub.api.PubnubException;

import org.json.JSONException;
import org.json.JSONObject;

import java.net.URI;
import java.net.URISyntaxException;

import io.realm.Realm;
import io.realm.RealmConfiguration;
import io.realm.RealmResults;

public class RecordActivity extends AppCompatActivity {

    private Pubnub      pubnub;
    private int         match;
    private boolean     notified;
    private WeakHandler handler;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_record);

        TextToSpeech.sharedInstance().initWithContext(
            getHost(getString(R.string.watson_stream))
        );
        TextToSpeech.sharedInstance().setCredentials(
            getString(R.string.watson_username),
            getString(R.string.watson_password)
        );
        TextToSpeech.sharedInstance().setVoice("en-US_MichaelVoice");

        handler = new WeakHandler(new Handler.Callback() {
            @Override
            public boolean handleMessage(Message message) {
                Bundle bundle;
                String action;

                bundle = message.getData();
                action = bundle.getString("action");

                if (action.equals("lookup")) {
                    StringRequest request = new StringRequest(Request.Method.GET, "http://ridealong.mybluemix.net/api/weather?latitude=" + bundle.getDouble("latitude") + "&longitude=" + bundle.getDouble("longitude"), new Response.Listener<String>() {
                        @Override
                        public void onResponse(String response) {
                            Log.d("RECORD", response);
                            TextToSpeech.sharedInstance().synthesize(response);
                        }
                    }, new Response.ErrorListener() {
                        @Override
                        public void onErrorResponse(VolleyError error) {
                            error.printStackTrace();
                        }
                    });

                    Volley.newRequestQueue(getApplicationContext()).add(request);
                }

                return false;
            }
        });

        pubnub = new Pubnub(
            getString(R.string.publish_key),
            getString(R.string.subscribe_key)
        );

        notified = false;
        match = 0;

        try {
            pubnub.subscribe("channel-ridealong", new Callback() {
                private Realm realm;

                @Override
                public void connectCallback(String channel, Object message) {
                    RealmConfiguration config = new RealmConfiguration.Builder(getApplicationContext()).build();
                    realm = Realm.getInstance(config);
                }

                public void disconnectCallback(String channel, Object message) {
                    realm.close();
                }

                public void reconnectCallback(String channel, Object message) {
                    RealmConfiguration config = new RealmConfiguration.Builder(getApplicationContext()).build();
                    realm = Realm.getInstance(config);
                }

                @Override
                public void successCallback(String channel, Object message) {
                    super.successCallback(channel, message);

                    JSONObject  data;
                    double      latitude;
                    double      longitude;
                    double[]    bottom;
                    double[]    top;
                    RealmResults<Location> locations;

                    try {
                        data = new JSONObject(message.toString());

                        latitude = data.getDouble("latitude");
                        longitude = data.getDouble("longitude");

                        top = addDistance(latitude, longitude, -10.0);
                        bottom = addDistance(latitude, longitude, 10.0);

                        Log.d("RECORD", "Origin: " + latitude + ", " + longitude);

                        locations = realm.where(Location.class)
                                .greaterThan("latitude", top[0])
                                .greaterThan("longitude", top[1])
                                .lessThan("latitude", bottom[0])
                                .lessThan("longitude", bottom[1])
                                .findAll();

                        Log.d("RECORD", locations.size() + " locations found.");

                        if (locations.size() >= 1) {
                            match = match + 1;
                            Log.d("RECORD", "Found: " + match);
                        } else {
                            match = 0;
                        }

                        if (match >= 5 && !notified) {
                            notified = true;

                            RealmResults<Route> routes = realm.where(Route.class)
                                    .equalTo("createdAt", locations.get(0).getRouteId())
                                    .findAll();

                            locations = realm.where(Location.class)
                                    .equalTo("routeId", routes.get(0).getCreatedAt())
                                    .findAllSorted("createdAt", false);

                            Log.d("RECORD", "Last: " + locations.get(0).getLatitude() + ", " + locations.get(0).getLongitude());

                            Bundle bundle = new Bundle();
                            bundle.putString("action", "lookup");
                            bundle.putDouble("latitude", locations.get(0).getLatitude());
                            bundle.putDouble("longitude", locations.get(0).getLongitude());

                            Message jump = new Message();
                            jump.setData(bundle);

                            handler.sendMessage(jump);
                        }
                    } catch (JSONException jsone) {
                        jsone.printStackTrace();
                    }
                }
            });
        } catch (PubnubException pne) {
            pne.printStackTrace();
        }
    }

    private double[] addDistance(double latitude, double longitude, double distance) {
        double[] point = new double[2];

        point[0] = latitude + (180 / Math.PI) * (distance / 6378137);
        point[1] = longitude + (180 / Math.PI) * (distance / 6378137) / Math.cos(Math.PI / 180 * latitude);

        return point;
    }

    public URI getHost(String url) {
        try {
            return new URI(url);
        } catch(URISyntaxException urise) {
            urise.printStackTrace();
        }

        return null;
    }

}
