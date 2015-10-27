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

import org.json.JSONObject;

public class GolfActivity extends AppCompatActivity {

    private DisplayMetrics      metrics;
    private LocationManager     gps;
    private MobileFirst         mobile;
    private Watson              watson;
    private WeakHandler         handler;

    private ImageView           imgBall;
    private LinearLayout        layCurrent;
    private LinearLayout        layTranscript;
    private ParallaxImageView   imgBackground;
    private TextView            txtTranscript;

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
        layCurrent = (LinearLayout)findViewById(R.id.layout_current);
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
            public void onForecast(Forecast daily) {
                Log.d("SHACKCADDY", "Forecast.");
                watson.say("The golf forecast for " + daily.place + " on " + daily.dayName + " is " + daily.golfCategory + "." );
            }

            @Override
            public void onCurrent(Forecast observed) {
                Bundle  bundle;
                Message message;

                Log.d("SHACKCADDY", "Current.");

                bundle = new Bundle();
                bundle.putString("action", "current");
                bundle.putString("icon", observed.icon);
                bundle.putInt("temperature", observed.temperature);
                bundle.putString("phrase", observed.phrase);
                bundle.putInt("maximum", observed.maximum);
                bundle.putInt("minimum", observed.minimum);

                message = new Message();
                message.setData(bundle);
                handler.sendMessage(message);
            }

            @Override
            public void onTest(String response) {
                Log.d("SHACKCADDY", "Test.");
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

                // Load from server
                mobile.forecast(place, dayOfWeek);
            }
        });

        // Weak handler
        handler = new WeakHandler(new Handler.Callback() {
            @Override
            public boolean handleMessage(Message message) {
                Bundle              bundle;
                String              temperature;
                String              transcript;
                TranslateAnimation  slide;

                bundle = message.getData();

                switch(bundle.getString("action")) {
                    case "listen":
                        txtTranscript.setText(getString(R.string.gopher_talk));

                        slide = new TranslateAnimation(0, 0, metrics.heightPixels - dipsToPixels(173), 0);
                        slide.setDuration(1000);

                        layTranscript.setVisibility(View.VISIBLE);
                        layTranscript.startAnimation(slide);

                        break;

                    case "message":
                        transcript = bundle.getString("transcript").trim();

                        if(bundle.getBoolean("final")) {
                            transcript = transcript + ".";
                        } else {
                            transcript = transcript + "...";
                        }

                        txtTranscript.setText(transcript);
                        break;

                    case "current":
                        ImageView imgIcon = (ImageView)findViewById(R.id.image_icon);
                        DownloadTask download = new DownloadTask(imgIcon);
                        download.execute(bundle.getString("icon"));

                        temperature = String.valueOf(bundle.getInt("temperature")) + getString(R.string.degrees);
                        TextView txtTemperature = (TextView)findViewById(R.id.text_temperature);
                        txtTemperature.setText(temperature);

                        TextView txtPhrase = (TextView)findViewById(R.id.text_phrase);
                        txtPhrase.setText(bundle.getString("phrase"));

                        temperature = String.valueOf(bundle.getInt("maximum")) + getString(R.string.degrees);
                        TextView txtMaximum = (TextView)findViewById(R.id.text_maximum);
                        txtMaximum.setText(temperature);

                        temperature = String.valueOf(bundle.getInt("minimum")) + getString(R.string.degrees);
                        TextView txtMinimum = (TextView)findViewById(R.id.text_minimum);
                        txtMinimum.setText(temperature);

                        // Do not show if in the middle of a transcript
                        if(!watson.isRecording()) {
                            layCurrent.setVisibility(View.VISIBLE);
                        }

                        break;
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
                layCurrent.setVisibility(View.INVISIBLE);

                // Fade into distance
                alpha = new AlphaAnimation(1.0f, 0.0f);
                alpha.setDuration(500);
                alpha.setStartOffset(500);

                // Shrink into distance
                scale = new ScaleAnimation(1f, 0f, 1f, 0f, ScaleAnimation.RELATIVE_TO_SELF, 0.5f, ScaleAnimation.RELATIVE_TO_SELF, 0.5f);
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

    private int dipsToPixels(int dips) {
        final float scale = getResources().getDisplayMetrics().density;
        return (int)(dips * scale + 0.5f);
    }
}
