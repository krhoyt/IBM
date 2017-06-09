package ibm.us.com.fashionfinder;

import android.util.Log;

import org.eclipse.paho.client.mqttv3.IMqttActionListener;
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.IMqttToken;
import org.eclipse.paho.client.mqttv3.MqttAsyncClient;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;

import java.util.ArrayList;

public class Weather {

    private ArrayList<WeatherListener>  observers;
    private MqttAsyncClient             client;
    private MqttConnectOptions          options;

    public Weather(String userName, String password) {
        observers = new ArrayList<>();

        options = new MqttConnectOptions();
        options.setCleanSession(true);
        options.setUserName(userName);
        options.setPassword(password.toCharArray());
    }

    public void connect(String uri, String clientId) {
        MemoryPersistence persistence = new MemoryPersistence();

        try {
            client = new MqttAsyncClient(
                uri,
                clientId,
                persistence
            );

            client.connect(options, null, new IMqttActionListener() {
                @Override
                public void onSuccess(IMqttToken iMqttToken) {
                    Log.d("WEATHER", "Connected.");

                    for(WeatherListener observer:observers) {
                        observer.onConnect();
                    }
                }

                @Override
                public void onFailure(IMqttToken iMqttToken, Throwable throwable) {
                    Log.d("WEATHER", "Connection failed.");
                }
            });
        } catch (MqttException mqtte) {
            mqtte.printStackTrace();
        }
    }

    public void subscribe(String topic) {
        client.setCallback(new MqttCallback() {
            @Override
            public void connectionLost(Throwable throwable) {
                ;
            }

            @Override
            public void messageArrived(String topic, MqttMessage message) throws Exception {
                String payload = new String(message.getPayload());

                Log.d("WEATHER", "Message.");

                for(WeatherListener observer:observers) {
                    observer.onMessage(payload);
                }
            }

            @Override
            public void deliveryComplete(IMqttDeliveryToken iMqttDeliveryToken) {
                ;
            }
        });

        try {
            client.subscribe(topic, 0, null, new IMqttActionListener() {
                @Override
                public void onSuccess(IMqttToken token) {
                    Log.d("WEATHER", "Subscribed.");

                    for(WeatherListener observer:observers) {
                        observer.onSubscribe();
                    }
                }

                @Override
                public void onFailure(IMqttToken token, Throwable throwable) {
                    Log.d("WEATHER", "Not subscribed.");
                }
            });
        } catch (MqttException mqtte) {
            mqtte.printStackTrace();
        }
    }

    public void setWeatherListener(WeatherListener observer) {
        observers.add(observer);
    }

}
