package ibm.us.com.iotweather;

import android.graphics.drawable.Drawable;
import android.os.Handler;
import android.os.Message;
import android.support.v4.content.res.ResourcesCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.badoo.mobile.util.WeakHandler;
import com.pubnub.api.Callback;
import com.pubnub.api.Pubnub;
import com.pubnub.api.PubnubException;

import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

import java.text.DateFormat;
import java.util.Date;

public class WeatherActivity extends AppCompatActivity
{
    public static final String DRAWABLE_BEACH = "@drawable/beach";
    public static final String DRAWABLE_FIELD = "@drawable/field";
    public static final String DRAWABLE_ICICLES = "@drawable/icicles";
    public static final String DRAWABLE_SNOW = "@drawable/snow";
    public static final String KEY_CELCIUS = "celcius";
    public static final String KEY_DOCUMENTS = "docs";
    public static final String KEY_FAHRENHEIT = "fahrenheit";
    public static final String KEY_HUMIDITY = "humidity";
    public static final String KEY_TIMESTAMP = "timestamp";
    public static final String SYMBOL_DEGREE = "°";
    public static final String SYMBOL_PERCENT = "%";

    private ImageView       imgCircle = null;
    private ImageView       imgLoading = null;
    private ImageView       imgWeather = null;
    private LinearLayout    layWeather = null;
    private TextView        txtHumidity = null;
    private TextView        txtLoading = null;
    private TextView        txtTemperature = null;
    private TextView        txtUpdate = null;

    private Pubnub          pubnub = null;

    private WeakHandler     handler = null;

    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_weather);

        // References
        imgCircle = (ImageView)findViewById(R.id.image_circle);
        imgLoading = (ImageView)findViewById(R.id.image_earth);
        imgWeather = (ImageView)findViewById(R.id.image_weather);
        layWeather = (LinearLayout)findViewById(R.id.layout_weather);
        txtHumidity = (TextView)findViewById(R.id.text_humidity);
        txtLoading = (TextView)findViewById(R.id.text_loading);
        txtTemperature = (TextView)findViewById(R.id.text_temperature);
        txtUpdate = (TextView)findViewById(R.id.text_update);

        handler = new WeakHandler(new Handler.Callback() {
            @Override
            public boolean handleMessage(Message message) {
                Bundle  bundle;
                Weather weather;

                // Debug
                Log.d("HANDLER", "Got message.");

                // Get pertinent data
                bundle = message.getData();

                // Marshall to domain
                weather = new Weather();
                weather.celcius = bundle.getDouble(KEY_CELCIUS);
                weather.fahrenheit = bundle.getDouble(KEY_FAHRENHEIT);
                weather.humidity = bundle.getDouble(KEY_HUMIDITY);
                weather.timestamp = bundle.getLong(KEY_TIMESTAMP);

                // Update user interface
                update(weather);

                return false;
            }
        } );

        // Initial data
        JsonObjectRequest   request;

        request = new JsonObjectRequest(
            Request.Method.GET,
            getString( R.string.cloud_code ),
            null,
            new Response.Listener<JSONObject>() {
                @Override
                public void onResponse(JSONObject response) {
                    JSONObject  data;
                    Weather     weather;

                    try {
                        // Get data record
                        data = response.getJSONArray(KEY_DOCUMENTS).getJSONObject(0);

                        weather = new Weather();
                        weather.celcius = data.getDouble(KEY_CELCIUS);
                        weather.fahrenheit = data.getDouble(KEY_FAHRENHEIT);
                        weather.humidity = data.getDouble(KEY_HUMIDITY);
                        weather.timestamp = data.getLong(KEY_TIMESTAMP);

                        // Update user interface
                        update(weather);
                    } catch(JSONException jsone) {
                        Log.d("VOLLEY", jsone.getMessage());
                    }
                }
            },
            new Response.ErrorListener() {
                @Override
                public void onErrorResponse(VolleyError error) {
                    Log.d("VOLLEY", error.getMessage());
                }
            }
        );

        Volley.newRequestQueue(this).add(request);
    }

    protected void update(Weather weather)
    {
        Date        date;
        DateFormat  format;
        Drawable    scene;
        int         id;
        Long        fahrenheit;
        Long        humidity;
        String      path;

        // Debug
        Log.d("WEATHER", "Updating weather.");

        // Rounding for display
        fahrenheit = Math.round(weather.fahrenheit);
        humidity = Math.round(weather.humidity);

        // Populate user interface
        txtTemperature.setText(fahrenheit.toString() + SYMBOL_DEGREE);
        txtHumidity.setText(humidity.toString() + SYMBOL_PERCENT);

        // Background image
        if(weather.celcius >= -20 && weather.celcius <= -7) {
            path = DRAWABLE_ICICLES;
        } else if (weather.celcius >= -6 && weather.celcius <= 7) {
            path = DRAWABLE_SNOW;
        } else if (weather.celcius >= 8 && weather.celcius <= 21) {
            path = DRAWABLE_FIELD;
        } else if (weather.celcius >= 22 && weather.celcius <= 35) {
            path = DRAWABLE_BEACH;
        } else {
            path = DRAWABLE_BEACH;
        }

        id = getResources().getIdentifier(path, null, getPackageName());
        scene = ResourcesCompat.getDrawable(getResources(), id, null);
        imgWeather.setImageDrawable(scene);

        // Timestamp
        date = new Date(weather.timestamp * 1000);
        format = DateFormat.getDateTimeInstance();
        format.format(date);
        txtUpdate.setText(format.format(date));

        // Show key elements
        imgWeather.setVisibility(View.VISIBLE);
        imgCircle.setVisibility(View.VISIBLE);
        layWeather.setVisibility(View.VISIBLE);
        txtUpdate.setVisibility(View.VISIBLE);

        // Hide loading
        txtLoading.setVisibility(View.INVISIBLE);
        imgLoading.setVisibility(View.INVISIBLE);

        if(pubnub == null)
        {
            pubnub = new Pubnub(
                getString(R.string.pubnub_publish),
                getString(R.string.pubnub_subscribe)
            );

            try {
                pubnub.subscribe(
                    getString(R.string.pubnub_channel),
                    new Callback() {
                    @Override
                    public void successCallback(String channel, Object data) {
                        Bundle      bundle;
                        JSONObject  document;
                        JSONTokener tokens;
                        Message     message;

                        // Debug
                        Log.d("PUBNUB", data.toString());

                        try {
                            // Parse
                            tokens = new JSONTokener(data.toString());
                            document = new JSONObject(tokens);

                            // Get key data
                            bundle = new Bundle();
                            bundle.putDouble(KEY_CELCIUS, document.getDouble(KEY_CELCIUS));
                            bundle.putDouble(KEY_FAHRENHEIT, document.getDouble(KEY_FAHRENHEIT));
                            bundle.putDouble(KEY_HUMIDITY, document.getDouble(KEY_HUMIDITY));
                            bundle.putLong(KEY_TIMESTAMP, document.getLong(KEY_TIMESTAMP));

                            // Assemble message
                            // Cross-thead communication
                            message = new Message();
                            message.setData(bundle);

                            // Send message
                            handler.sendMessage(message);
                        } catch(JSONException jsone) {
                            Log.d("PUBNUB", jsone.getMessage());
                        }
                    }
                });
            } catch(PubnubException pne) {
                Log.d("PUBNUB", pne.getMessage());
            }
        }
    }
}
