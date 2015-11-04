package ibm.us.com.fashionx;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.BitmapDrawable;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Handler;
import android.os.Message;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.badoo.mobile.util.WeakHandler;
import com.ibm.caas.CAASAssetRequest;
import com.ibm.caas.CAASDataCallback;
import com.ibm.caas.CAASErrorResult;

public class MainActivity extends AppCompatActivity {

    public static final String FASHION_APP = "fashion app/views/all";

    private ImageView       imgSuggest;

    private LocationManager gps;
    private MobileContent   content;
    private MobileFirst     mobile;
    private WeakHandler     handler;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // User interface
        imgSuggest = (ImageView) findViewById(R.id.image_suggest);

        // Weak handler
        handler = new WeakHandler(new Handler.Callback() {
            @Override
            public boolean handleMessage(Message message) {
                Bundle bundle;
                String action;
                String concat;

                bundle = message.getData();
                action = bundle.getString("action");

                switch(action) {
                    case "weather":
                        // Results
                        MobileFirstWeather weather = bundle.getParcelable("weather");

                        // Temperature
                        concat = weather.temperature + "°";
                        TextView txtTemperature = (TextView) findViewById(R.id.text_temperature);
                        txtTemperature.setText(concat);

                        // Icon
                        ImageView       imgPhrase = (ImageView) findViewById(R.id.image_phrase);
                        DownloadTask    task = new DownloadTask(imgPhrase);
                        task.execute(weather.path);

                        // Phrase
                        TextView txtPhrase = (TextView) findViewById(R.id.text_phrase);
                        txtPhrase.setText(weather.phrase);

                        // Maximum
                        if(weather.maximum == 9999) {
                            concat = "--";
                        } else {
                            concat = weather.maximum + "°";
                        }

                        TextView txtMaximum = (TextView) findViewById(R.id.text_maximum);
                        txtMaximum.setText(concat);

                        // Minimum
                        concat = weather.minimum + "°";
                        TextView txtMinimum = (TextView) findViewById(R.id.text_minimum);
                        txtMinimum.setText(concat);

                        break;
                }

                return false;
            }
        });

        // Mobile Client Access
        mobile = new MobileFirst(getApplicationContext());
        mobile.setMobileFirstListener(new MobileFirstListener() {
            // Current weather conditions
            @Override
            public void onCurrent(MobileFirstWeather current) {
                Bundle  bundle = new Bundle();
                Message message = new Message();

                bundle.putString("action", "weather");
                bundle.putParcelable("weather", current);
                message.setData(bundle);

                handler.sendMessage(message);

                content.suggest(current.phrase);
            }
        });

        // Mobile Content
        content = new MobileContent(getApplicationContext(), FASHION_APP);
        content.setMobileContentListener(new MobileContentListener() {
            @Override
            public void onSuggest(String path) {
                Log.d("MAIN", path);

                CAASDataCallback<byte[]> callback = new CAASDataCallback<byte[]>() {
                    @Override
                    public void onSuccess(byte[] bytes) {
                        Bitmap bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
                        BitmapDrawable drawable = new BitmapDrawable(
                            getApplicationContext().getResources(),
                            bitmap
                        );
                        imgSuggest.setImageDrawable(drawable);
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

        // Location history
        SharedPreferences history = getPreferences(Context.MODE_PRIVATE);

        if (history.contains("latitude")) {
            float latitude = history.getFloat("latitude", 0);
            float longitude = history.getFloat("longitude", 0);

            // Weather from cached location
            mobile.current(latitude, longitude);
        }

        // Current location
        if(ContextCompat.checkSelfPermission(getApplicationContext(), "android.permission.ACCESS_COARSE_LOCATION") == PackageManager.PERMISSION_GRANTED) {
            Log.d("MAIN", "Add location monitor.");
        }

        LocationListener monitor = new LocationListener() {
            @Override
            public void onLocationChanged(Location location) {
                if(ContextCompat.checkSelfPermission(getApplicationContext(), "android.permission.ACCESS_COARSE_LOCATION") == PackageManager.PERMISSION_GRANTED) {
                    Log.d("MAIN", "Remove location monitor.");
                }

                // Just once
                gps.removeUpdates(this);

                float latitude = (float) location.getLatitude();
                float longitude = (float) location.getLongitude();

                // Store on device
                SharedPreferences history = getPreferences(Context.MODE_PRIVATE);
                SharedPreferences.Editor editor = history.edit();
                editor.putFloat("latitude", latitude);
                editor.putFloat("longitude", longitude);
                editor.apply();

                // Request weather
                mobile.current(latitude, longitude);
            }

            @Override
            public void onStatusChanged(String provider, int status, Bundle extras) {
                ;
            }

            @Override
            public void onProviderEnabled(String provider) {
                ;
            }

            @Override
            public void onProviderDisabled(String provider) {
                ;
            }
        };

        gps = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        gps.requestLocationUpdates(LocationManager.GPS_PROVIDER, 0, 0, monitor);

        // Navigation
        ImageView imgNavigate = (ImageView) findViewById(R.id.image_navigate);
        imgNavigate.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(MainActivity.this, NavigateActivity.class);
                startActivity(intent);
            }
        });

        // Catalog
        LinearLayout layCatalog = (LinearLayout) findViewById(R.id.layout_catalog);
        layCatalog.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(MainActivity.this, CatalogActivity.class);
                startActivity(intent);
            }
        });
    }

}
