package ibm.us.com.fashionfinder;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.os.Handler;
import android.os.Message;
import android.support.v4.content.res.ResourcesCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.widget.ImageView;

import com.badoo.mobile.util.WeakHandler;
import com.ibm.caas.CAASAssetRequest;
import com.ibm.caas.CAASDataCallback;
import com.ibm.caas.CAASErrorResult;

import org.eclipse.paho.client.mqttv3.IMqttActionListener;
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.IMqttToken;
import org.eclipse.paho.client.mqttv3.MqttAsyncClient;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.MqttSecurityException;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;

public class MainActivity extends AppCompatActivity {

    private Content     content;
    private ImageView   imgWeather;
    private Weather     client;
    private WeakHandler handler;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        imgWeather = (ImageView) findViewById(R.id.image_weather);

        handler = new WeakHandler(new Handler.Callback() {
            @Override
            public boolean handleMessage(Message message) {
                ArrayList<String>   keywords;
                boolean             changes;
                Bundle              bundle;
                Drawable            icon;
                ImageView           image;
                int                 identifier;
                JSONArray           icons;
                JSONArray           names;
                JSONObject          data;
                JSONObject          weather;
                String              payload;

                keywords = new ArrayList<>();
                changes = false;

                bundle = message.getData();
                payload = bundle.getString("payload");

                try {
                    data = new JSONObject(payload);
                    weather = data.getJSONObject("d");
                    icons = weather.getJSONArray("icons");
                    names = weather.getJSONArray("names");

                    for(int w = 0; w < names.length(); w++) {
                        identifier = getResources().getIdentifier(
                            "image_" + names.getString(w),
                            "id",
                            getPackageName()
                        );
                        image = (ImageView) findViewById(identifier);

                        if(image.getTag() == null)
                        {
                            // Log.d("MAIN", names.getString(w) + " not set.");
                            image.setTag(icons.getString(w));
                        } else {
                            if(!image.getTag().equals(icons.getString(w))) {
                                // Log.d("MAIN", "Changed: " + icons.getString(w));

                                image.setTag(icons.getString(w));
                                identifier = getResources().getIdentifier(
                                    "@drawable/" + icons.getString(w),
                                    null,
                                    getPackageName()
                                );
                                icon = ResourcesCompat.getDrawable(getResources(), identifier, null);
                                image.setImageDrawable(icon);

                                keywords.add(icons.getString(w));
                                changes = true;
                            } else {
                                // Log.d("MAIN", icons.getString(w) + " has no change.");
                            }
                        }
                    }

                    if(changes) {
                        content.fashion(keywords);
                    }
                } catch (JSONException jsone) {
                    jsone.printStackTrace();
                }

                return false;
            }
        });

        // Mobile Content
        content = new Content(
            getApplicationContext().getString(R.string.macm_server),
            getApplicationContext().getString(R.string.macm_context),
            getApplicationContext().getString(R.string.macm_instance),
            getApplicationContext().getString(R.string.macm_user),
            getApplicationContext().getString(R.string.macm_password)
        );
        content.setContentListener(new ContentListener() {
            @Override
            public void onFashion(String path) {
                Log.d("MAIN", "Fashion.");

                CAASDataCallback<byte[]> callback = new CAASDataCallback<byte[]>() {
                    @Override
                    public void onSuccess(byte[] bytes) {
                        Bitmap bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
                        BitmapDrawable drawable = new BitmapDrawable(
                            getApplicationContext().getResources(),
                            bitmap
                        );
                        imgWeather.setImageDrawable(drawable);
                    }

                    @Override
                    public void onError(CAASErrorResult error) {
                        Log.e("CAAS", "Image failed: " + error);
                    }
                };
                CAASAssetRequest request = new CAASAssetRequest(path, callback);
                content.getService().executeRequest(request);
            }
        });

        // IoT Foundation
        client = new Weather(
            getString(R.string.fashion_username),
            getString(R.string.fashion_password)
        );
        client.setWeatherListener(new WeatherListener() {
            @Override
            public void onConnect() {
                Log.d("MAIN", "Connected.");
                client.subscribe(getString(R.string.fashion_topic));
            }

            @Override
            public void onMessage(String payload) {
                Log.d("MAIN", "Message.");

                Bundle bundle = new Bundle();
                bundle.putString("payload", payload);

                Message message = new Message();
                message.setData(bundle);

                handler.sendMessage(message);
            }

            @Override
            public void onSubscribe() {
                Log.d("MAIN", "Subscribed.");
            }
        });
        client.connect(
            getString(R.string.fashion_uri),
            getString(R.string.fashion_client)
        );
    }

}
