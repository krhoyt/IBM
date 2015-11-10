package ibm.us.com.fashionfinder;

import android.graphics.drawable.Drawable;
import android.os.Handler;
import android.os.Message;
import android.support.v4.content.res.ResourcesCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.widget.ImageView;

import com.badoo.mobile.util.WeakHandler;

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
import org.json.JSONObject;

public class MainActivity extends AppCompatActivity {

    private MqttAsyncClient client;
    private WeakHandler     handler;

    private ImageView       imgDirection;
    private ImageView       imgHumidity;
    private ImageView       imgLight;
    private ImageView       imgPressure;
    private ImageView       imgRain;
    private ImageView       imgSpeed;
    private ImageView       imgTemperature;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        imgDirection = (ImageView) findViewById(R.id.image_direction);
        imgHumidity = (ImageView) findViewById(R.id.image_humidity);
        imgLight = (ImageView) findViewById(R.id.image_light);
        imgPressure = (ImageView) findViewById(R.id.image_pressure);
        imgRain = (ImageView) findViewById(R.id.image_rain);
        imgSpeed = (ImageView) findViewById(R.id.image_speed);
        imgTemperature = (ImageView) findViewById(R.id.image_temperature);

        handler = new WeakHandler(new Handler.Callback() {
            @Override
            public boolean handleMessage(Message message) {
                Bundle bundle = message.getData();

                int id = getResources().getIdentifier("@drawable/" + bundle.getString("direction"), null, getPackageName());
                Drawable scene = ResourcesCompat.getDrawable(getResources(), id, null);
                imgDirection.setImageDrawable(scene);

                id = getResources().getIdentifier("@drawable/" + bundle.getString("humidity"), null, getPackageName());
                scene = ResourcesCompat.getDrawable(getResources(), id, null);
                imgHumidity.setImageDrawable(scene);

                id = getResources().getIdentifier("@drawable/" + bundle.getString("light"), null, getPackageName());
                scene = ResourcesCompat.getDrawable(getResources(), id, null);
                imgLight.setImageDrawable(scene);

                id = getResources().getIdentifier("@drawable/" + bundle.getString("pressure"), null, getPackageName());
                scene = ResourcesCompat.getDrawable(getResources(), id, null);
                imgPressure.setImageDrawable(scene);

                id = getResources().getIdentifier("@drawable/" + bundle.getString("rain"), null, getPackageName());
                scene = ResourcesCompat.getDrawable(getResources(), id, null);
                imgRain.setImageDrawable(scene);

                id = getResources().getIdentifier("@drawable/" + bundle.getString("speed"), null, getPackageName());
                scene = ResourcesCompat.getDrawable(getResources(), id, null);
                imgSpeed.setImageDrawable(scene);

                id = getResources().getIdentifier("@drawable/" + bundle.getString("temperature"), null, getPackageName());
                scene = ResourcesCompat.getDrawable(getResources(), id, null);
                imgTemperature.setImageDrawable(scene);

                return false;
            }
        });

        try {
            MqttConnectOptions options = new MqttConnectOptions();
            options.setCleanSession(true);
            options.setUserName(getString(R.string.fashion_username));
            options.setPassword(getString(R.string.fashion_password).toCharArray());

            MemoryPersistence persistence = new MemoryPersistence();

            client = new MqttAsyncClient(
                getString(R.string.fashion_uri),
                getString(R.string.fashion_client),
                persistence
            );
            client.setCallback(new MqttCallback() {
                @Override
                public void connectionLost(Throwable throwable) {
                    ;
                }

                @Override
                public void messageArrived(String topic, MqttMessage mqtt) throws Exception {
                    Bundle bundle = new Bundle();
                    String payload = new String(mqtt.getPayload());
                    JSONObject data = new JSONObject(payload);
                    JSONObject weather = data.getJSONObject("d");
                    JSONObject condition = weather.getJSONObject("direction");
                    bundle.putString("direction", condition.getString("icon"));

                    condition = weather.getJSONObject("humidity");
                    bundle.putString("humidity", condition.getString("icon"));

                    condition = weather.getJSONObject("light");
                    bundle.putString("light", condition.getString("icon"));

                    condition = weather.getJSONObject("pressure");
                    bundle.putString("pressure", condition.getString("icon"));

                    condition = weather.getJSONObject("rain");
                    bundle.putString("rain", condition.getString("icon"));

                    condition = weather.getJSONObject("speed");
                    bundle.putString("speed", condition.getString("icon"));

                    condition = weather.getJSONObject("temperature");
                    bundle.putString("temperature", condition.getString("icon"));

                    Message message = new Message();
                    message.setData(bundle);
                    handler.sendMessage(message);
                }

                @Override
                public void deliveryComplete(IMqttDeliveryToken iMqttDeliveryToken) {
                    ;
                }
            });
            client.connect(options, null, new IMqttActionListener() {
                @Override
                public void onSuccess(IMqttToken iMqttToken) {
                    Log.d("MAIN", "Connected.");

                    try {
                        client.subscribe(getString(R.string.fashion_topic), 0, null, new IMqttActionListener() {
                            @Override
                            public void onSuccess(IMqttToken iMqttToken) {
                                Log.d("MAIN", "Subscribed.");
                            }

                            @Override
                            public void onFailure(IMqttToken iMqttToken, Throwable throwable) {
                                Log.d("MAIN", "Not subscribed.");
                            }
                        });
                    } catch (MqttException mqtte) {
                        mqtte.printStackTrace();
                    }
                }

                @Override
                public void onFailure(IMqttToken iMqttToken, Throwable throwable) {
                    Log.d("MAIN", "Connection failed.");
                }
            });
        } catch (MqttException mqtte) {
            mqtte.printStackTrace();
        }
    }
}
