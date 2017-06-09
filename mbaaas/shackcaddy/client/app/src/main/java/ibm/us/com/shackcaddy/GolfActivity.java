package ibm.us.com.shackcaddy;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.media.AudioManager;
import android.media.SoundPool;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.View;
import android.view.animation.AlphaAnimation;
import android.view.animation.Animation;
import android.view.animation.AnimationSet;
import android.view.animation.ScaleAnimation;
import android.view.animation.TranslateAnimation;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.badoo.mobile.util.WeakHandler;
import com.ibm.mobilefirstplatform.clientsdk.android.core.api.Response;
import com.ibm.mobilefirstplatform.clientsdk.android.core.api.ResponseListener;
import com.ibm.mobilefirstplatform.clientsdk.android.logger.api.Logger;
import com.nvanbenschoten.motion.ParallaxImageView;

import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.json.JSONObject;

public class GolfActivity extends AppCompatActivity {

    // Support
    private DisplayMetrics      metrics;
    private LocationManager     gps;
    private MobileFirst         mobile;
    private Watson              watson;
    private WeakHandler         handler;

    // User interface
    private ImageView           imgBall;
    private LinearLayout        layWeather;
    private LinearLayout        layTranscript;
    private ParallaxImageView   imgBackground;
    private TextView            txtTranscript;

    // Audio
    private float               volume;
    private int                 swing;
    private SoundPool           sound;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_golf);

        // Screen dimensions
        metrics = new DisplayMetrics();
        getWindowManager().getDefaultDisplay().getMetrics(metrics);

        // User interface
        imgBall = (ImageView)findViewById(R.id.image_ball);
        layWeather = (LinearLayout)findViewById(R.id.layout_weather);
        layTranscript = (LinearLayout)findViewById(R.id.layout_transcript);
        txtTranscript = (TextView)findViewById(R.id.text_transcript);

        // Parallax
        imgBackground = (ParallaxImageView)findViewById(R.id.image_background);

        // Sound effects
        AudioManager audio = (AudioManager)getSystemService(AUDIO_SERVICE);

        float actual = (float)audio.getStreamVolume(AudioManager.STREAM_MUSIC);
        float maximum = (float)audio.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
        volume = actual / maximum;

        setVolumeControlStream(AudioManager.STREAM_MUSIC);

        sound = new SoundPool(10, AudioManager.STREAM_MUSIC, 0);
        swing = sound.load(this, R.raw.golf_swing, 1);

        // Logging
        Logger.setCapture(true);
        Logger.setLevel(Logger.LEVEL.DEBUG);
        Logger.send();
        Logger.sendAnalytics(new ResponseListener() {
            @Override
            public void onSuccess(Response response) {
                Log.d("SHACKCADDY", "Success: " + response.getResponseText());
            }

            @Override
            public void onFailure(Response response, Throwable t, JSONObject extendedInfo) {
                Log.d("SHACKCADDY", "Fail: " + response.getResponseText());
            }
        });

        // MobileFirst
        mobile = new MobileFirst(getApplicationContext());
        mobile.setMobileFirstListener(new MobileFirstListener() {
            @Override
            public void onForecast(Forecast forecast) {
                Bundle  bundle;
                Message message;

                Log.d("SHACKCADDY", "Forecast.");

                // Marshal forecast
                bundle = new Bundle();
                bundle.putString("action", "golf");
                bundle.putString("place", forecast.place);
                bundle.putString("dow", forecast.dayOfWeek);
                bundle.putInt("temperature", forecast.maximum);
                bundle.putString("icon", forecast.icon);
                bundle.putString("phrase", forecast.phrase);
                bundle.putInt("maximum", forecast.maximum);
                bundle.putInt("minimum", forecast.minimum);
                bundle.putString("direction", forecast.windCardinal);
                bundle.putInt("speed", forecast.windSpeed);
                bundle.putInt("index", forecast.uvIndex);
                bundle.putString("uv", forecast.uvDescription);
                bundle.putString("sunrise", forecast.sunrise);
                bundle.putString("sunset", forecast.sunset);

                // Send to UI thread
                message = new Message();
                message.setData(bundle);
                handler.sendMessage(message);

                // Synthesize result
                watson.say(
                    "The golf forecast for " +
                    forecast.place +
                    " on " +
                    forecast.dayOfWeek +
                    " is " +
                    forecast.golfCategory +
                    "."
                );
            }

            @Override
            public void onCurrent(Forecast current) {
                Bundle  bundle;
                Message message;

                Log.d("SHACKCADDY", "Current.");

                // Marshal current conditions
                bundle = new Bundle();
                bundle.putString("action", "current");
                bundle.putString("place", "Current Location");
                bundle.putString("dow", null);
                bundle.putInt("temperature", current.temperature);
                bundle.putString("icon", current.icon);
                bundle.putString("phrase", current.phrase);
                bundle.putInt("maximum", current.maximum);
                bundle.putInt("minimum", current.minimum);
                bundle.putString("direction", current.windCardinal);
                bundle.putInt("speed", current.windSpeed);
                bundle.putInt("index", current.uvIndex);
                bundle.putString("uv", current.uvDescription);
                bundle.putString("sunrise", current.sunrise);
                bundle.putString("sunset", current.sunset);

                // Send to UI thread
                message = new Message();
                message.setData(bundle);
                handler.sendMessage(message);
            }
        });

        // Location history
        SharedPreferences history = getPreferences(Context.MODE_PRIVATE);

        if(history.contains("latitude")) {
            float latitude = history.getFloat("latitude", 0);
            float longitude = history.getFloat("longitude", 0);

            mobile.current(latitude, longitude);
        }

        // Location
        if(ContextCompat.checkSelfPermission(getApplicationContext(), "android.permission.ACCESS_COARSE_LOCATION") == PackageManager.PERMISSION_GRANTED) {
            Log.d("GPS", "Granted.");
        }

        LocationListener monitor = new LocationListener() {
            @Override
            public void onLocationChanged(Location location) {
                float latitude;
                float longitude;

                if(ContextCompat.checkSelfPermission(getApplicationContext(), "android.permission.ACCESS_COARSE_LOCATION") == PackageManager.PERMISSION_GRANTED) {
                    Log.d("GPS", "Granted.");
                }

                // Just once
                gps.removeUpdates(this);

                latitude = (float)location.getLatitude();
                longitude = (float)location.getLongitude();

                // Store on device
                SharedPreferences history = getPreferences(Context.MODE_PRIVATE);
                SharedPreferences.Editor editor = history.edit();
                editor.putFloat("latitude", latitude);
                editor.putFloat("longitude", longitude);
                editor.apply();

                // Request conditions
                mobile.current(latitude, longitude);
            }

            @Override
            public void onStatusChanged(String provider, int status, Bundle extras) {;}

            @Override
            public void onProviderEnabled(String provider) {;}

            @Override
            public void onProviderDisabled(String provider) {;}
        };

        gps = (LocationManager)getSystemService(Context.LOCATION_SERVICE);
        gps.requestLocationUpdates(LocationManager.GPS_PROVIDER, 0, 0, monitor);

        // Watson
        watson = new Watson(getApplicationContext());
        watson.setWatsonListener(new WatsonListener() {
            @Override
            public void onListen() {
                Bundle  bundle;
                Message message;

                // Ready to listen
                Log.d("SHACKCADDY", "The gopher is listening.");

                bundle = new Bundle();
                bundle.putString("action", "listen");

                message = new Message();
                message.setData(bundle);
                handler.sendMessage(message);
            }

            @Override
            public void onMessage(Double confidence, String content) {
                Bundle bundle;
                Message message;

                // Updated transcript
                Log.d("SHACKCADDY", content + "(" + confidence + ")");

                bundle = new Bundle();
                bundle.putString("action", "message");
                bundle.putString("transcript", content);
                bundle.putBoolean("final", false);

                message = new Message();
                message.setData(bundle);
                handler.sendMessage(message);
            }

            @Override
            public void onComplete(Double confidence, String content) {
                Bundle  bundle;
                int     start;
                Message message;
                String  dayOfWeek;
                String  place;

                // Final transcript
                Log.d("SHACKCADDY", "Final: " + content);

                bundle = new Bundle();
                bundle.putString("action", "message");
                bundle.putString("transcript", content);
                bundle.putBoolean("final", true);

                message = new Message();
                message.setData(bundle);
                handler.sendMessage(message);

                // Parse
                start = content.trim().indexOf(" on ");

                place = content.substring(0, start).trim();
                dayOfWeek = content.substring(start + " on ".length()).trim();

                Log.d("SHACKCADDY", "Place: " + place);
                Log.d("SHACKCADDY", "Day of week: " + dayOfWeek);

                // Load forecast from server
                mobile.forecast(place, dayOfWeek);
            }
        });

        // Weak handler
        handler = new WeakHandler(new Handler.Callback() {
            @Override
            public boolean handleMessage(Message message) {
                AlphaAnimation      alpha;
                Bundle              bundle;
                String              action;
                String              transcript;
                TranslateAnimation  ball;
                TranslateAnimation  forecast;
                TranslateAnimation  gopher;

                bundle = message.getData();
                action = bundle.getString("action");

                if(action.equals("listen")) {
                    // Watson is connected and ready
                    txtTranscript.setText(getString(R.string.gopher_talk));

                    gopher = new TranslateAnimation(
                        0,
                        0,
                        metrics.heightPixels - dipsToPixels(173),
                        0
                    );
                    gopher.setDuration(1000);

                    layTranscript.setVisibility(View.VISIBLE);
                    layTranscript.startAnimation(gopher);
                } else if(action.equals("message")) {
                    // Watson has updated the transcript
                    transcript = bundle.getString("transcript").trim();

                    if(bundle.getBoolean("final")) {
                        transcript = transcript + ".";
                    } else {
                        transcript = transcript + "...";
                    }

                    txtTranscript.setText(transcript);
                } else if(action.equals("current")) {
                    // Weather forecast dialog
                    populate(bundle);

                    // Do not show if in the middle of a transcript
                    if(!watson.isRecording()) {
                        if(layWeather.getVisibility() == View.INVISIBLE) {
                            alpha = new AlphaAnimation(0, 1);
                            alpha.setDuration(1000);

                            layWeather.setVisibility(View.VISIBLE);
                            layWeather.startAnimation(alpha);
                        }
                    }
                } else if(action.equals("golf")) {
                    // Weather forecast dialog
                    populate(bundle);

                    gopher = new TranslateAnimation(
                        0,
                        0,
                        0,
                        metrics.heightPixels - dipsToPixels(130)
                    );
                    gopher.setDuration(1000);
                    gopher.setAnimationListener(new Animation.AnimationListener() {
                        @Override
                        public void onAnimationEnd(Animation animation) {
                            layTranscript.setVisibility(View.INVISIBLE);
                        }

                        @Override
                        public void onAnimationStart(Animation animation) {
                            ;
                        }

                        @Override
                        public void onAnimationRepeat(Animation animation) {
                            ;
                        }
                    });

                    layTranscript.startAnimation(gopher);

                    forecast = new TranslateAnimation(
                        0,
                        0,
                        metrics.heightPixels - dipsToPixels(130),
                        0
                    );
                    forecast.setDuration(1000);
                    forecast.setStartOffset(1000);

                    layWeather.setVisibility(View.VISIBLE);
                    layWeather.startAnimation(forecast);

                    ball = new TranslateAnimation(
                        0,
                        0,
                        metrics.heightPixels / 2,
                        0
                    );
                    ball.setDuration(1000);
                    ball.setStartOffset(2000);

                    imgBall.setVisibility(View.VISIBLE);
                    imgBall.startAnimation(ball);
                }

                return false;
            }
        });

        // Start workflow
        imgBall.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                AlphaAnimation      alpha;
                AnimationSet        ball;
                ScaleAnimation      scale;
                TranslateAnimation  fly;

                // Remove current conditions
                layWeather.setVisibility(View.INVISIBLE);

                // Fade into distance
                alpha = new AlphaAnimation(1, 0);
                alpha.setDuration(500);
                alpha.setStartOffset(500);

                // Shrink into distance
                scale = new ScaleAnimation(
                    1,
                    0,
                    1,
                    0,
                    ScaleAnimation.RELATIVE_TO_SELF,
                    0.5f,
                    ScaleAnimation.RELATIVE_TO_SELF,
                    0.5f
                );
                scale.setDuration(1000);

                // Move with ball strike
                fly = new TranslateAnimation(0, 0, 0, 0 - (metrics.heightPixels * 2));
                fly.setDuration(1000);

                // Group animations
                ball = new AnimationSet(true);
                ball.addAnimation(alpha);
                ball.addAnimation(fly);
                ball.addAnimation(scale);
                ball.setAnimationListener(new Animation.AnimationListener() {
                    @Override
                    public void onAnimationEnd(Animation animation) {
                        imgBall.setVisibility(View.INVISIBLE);
                    }

                    @Override
                    public void onAnimationStart(Animation animation) {;}

                    @Override
                    public void onAnimationRepeat(Animation animation) {;}
                });
                imgBall.startAnimation(ball);

                // Hit the ball
                sound.play(swing, volume, volume, 1, 0, 1f);

                // Watson transcription
                handler.postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        watson.recognize();
                    }
                }, 700);
            }
        });
    }

    // Accelerometer for parallax effect
    @Override
    protected void onPause() {
        super.onPause();
        imgBackground.unregisterSensorManager();
    }

    @Override
    protected void onResume() {
        super.onResume();
        imgBackground.registerSensorManager();
    }

    // Convenience
    protected int dipsToPixels(int dips) {
        final float scale = getResources().getDisplayMetrics().density;
        return (int)(dips * scale + 0.5f);
    }

    // Fill fields in weather dialog
    protected void populate(Bundle bundle) {
        DateTime            joda;
        DateTimeFormatter   format;
        DownloadTask        download;
        ImageView           imgIcon;
        String              concat;
        TextView            txtField;

        if(bundle.getString("dow") == null) {
            concat = "Weather for " + bundle.getString("place");
        } else {
            concat = bundle.getString("place") + " on " + bundle.getString("dow");
        }

        txtField = (TextView)findViewById(R.id.text_title);
        txtField.setText(concat);

        imgIcon = (ImageView)findViewById(R.id.image_icon);
        download = new DownloadTask(imgIcon);
        download.execute(bundle.getString("icon"));

        concat = bundle.getInt("temperature") + getString(R.string.degrees);
        txtField = (TextView)findViewById(R.id.text_temperature);
        txtField.setText(concat);

        txtField = (TextView)findViewById(R.id.text_phrase);
        txtField.setText(bundle.getString("phrase"));

        if(bundle.getInt("maximum") == 9999) {
            concat = "--";
        } else {
            concat = bundle.getInt("maximum") + getString(R.string.degrees);
        }

        txtField = (TextView)findViewById(R.id.text_maximum);
        txtField.setText(concat);

        concat = bundle.getInt("minimum") + getString(R.string.degrees);
        txtField = (TextView)findViewById(R.id.text_minimum);
        txtField.setText(concat);

        txtField = (TextView)findViewById(R.id.text_direction);
        txtField.setText(bundle.getString("direction"));

        concat = bundle.getInt("speed") + " MPH";
        txtField = (TextView)findViewById(R.id.text_speed);
        txtField.setText(concat);

        if(bundle.getString("uv").equals("Moderate")) {
            concat = "Mod";
        } else {
            concat = bundle.getInt("index") + " " + bundle.getString("uv");
        }

        txtField = (TextView)findViewById(R.id.text_uv);
        txtField.setText(concat);

        joda = DateTime.parse(bundle.getString("sunrise"));
        format = DateTimeFormat.forPattern("h:mm");
        concat = format.print(joda) + " AM";
        txtField = (TextView)findViewById(R.id.text_sunrise);
        txtField.setText(concat);

        joda = DateTime.parse(bundle.getString("sunset"));
        concat = format.print(joda) + " PM";
        txtField = (TextView)findViewById(R.id.text_sunset);
        txtField.setText(concat);
    }
}
