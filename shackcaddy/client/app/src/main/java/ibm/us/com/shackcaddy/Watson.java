package ibm.us.com.shackcaddy;

import android.content.Context;
import android.os.AsyncTask;
import android.util.Log;

import com.ibm.watson.developer_cloud.android.speech_to_text.v1.ISpeechDelegate;
import com.ibm.watson.developer_cloud.android.speech_to_text.v1.SpeechToText;
import com.ibm.watson.developer_cloud.android.speech_to_text.v1.dto.SpeechConfiguration;
import com.ibm.watson.developer_cloud.android.text_to_speech.v1.TextToSpeech;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;

public class Watson implements ISpeechDelegate {
    private ArrayList<WatsonListener>   observers;
    private boolean                     recording;
    private Double                      confidence;
    private String                      transcript;

    public Watson(Context context) {
        observers = new ArrayList<>();
        recording = false;

        // Speech to text
        SpeechConfiguration speech = new SpeechConfiguration(SpeechConfiguration.AUDIO_FORMAT_OGGOPUS);
        SpeechToText.sharedInstance().initWithContext(
            getHost(context.getString(R.string.watson_stt_stream)),
            context,
            speech
        );
        SpeechToText.sharedInstance().setCredentials(
            context.getString(R.string.watson_stt_username),
            context.getString(R.string.watson_stt_password)
        );
        SpeechToText.sharedInstance().setModel(context.getString(R.string.watson_model));
        SpeechToText.sharedInstance().setDelegate(this);

        // Text to speech
        TextToSpeech.sharedInstance().initWithContext(
            getHost(context.getString(R.string.watson_tts_stream))
        );
        TextToSpeech.sharedInstance().setCredentials(
            context.getString(R.string.watson_tts_username),
            context.getString(R.string.watson_tts_password)
        );
        TextToSpeech.sharedInstance().setVoice("en-US_MichaelVoice");
    }

    public void recognize() {
        recording = true;

        new AsyncTask<Void, Void, Void>() {
            @Override
            protected Void doInBackground(Void... none) {
                SpeechToText.sharedInstance().recognize();
                return null;
            }
        }.execute();
    }

    public void say(String transcript) {
        TextToSpeech.sharedInstance().synthesize(transcript);
    }

    public void stop() {
        SpeechToText.sharedInstance().stopRecognition();
    }

    public URI getHost(String url) {
        try {
            return new URI(url);
        } catch(URISyntaxException urise) {
            urise.printStackTrace();
        }

        return null;
    }

    public void setWatsonListener(WatsonListener observer) {
        observers.add(observer);
    }

    public boolean isRecording() {
        return recording;
    }

    @Override
    public void onOpen() {
        Log.d("WATSON", "Open.");
    }

    @Override
    public void onError(String error) {
        Log.d("WATSON", "Error: " + error);
    }

    @Override
    public void onClose(int code, String reason, boolean b) {
        Log.d("WATSON", "Close, code: " + code + ", reason: " + reason);

        recording = false;

        for(WatsonListener observer:observers) {
            observer.onComplete(confidence, transcript);
        }
    }

    @Override
    public void onMessage(String message) {
        boolean         finished;
        JSONArray       alternatives;
        JSONArray       results;
        JSONObject      alternate;
        JSONObject      data;
        JSONObject      holder;

        Log.d("WATSON", "Message: " + message);

        try {
            // Parse JSON
            data = new JSONObject(message);

            // State of listening
            if(data.has("results")) {
                // Some transcript available
                results = data.getJSONArray("results");
                holder = results.getJSONObject(0);
                alternatives = holder.getJSONArray("alternatives");
                alternate = alternatives.getJSONObject(0);

                transcript = alternate.getString("transcript");

                // May have confidence ranking
                if(alternate.has("confidence")) {
                    confidence = alternate.getDouble("confidence");
                } else {
                    confidence = 0.0;
                }

                // Indicates complete utterance
                finished = holder.getBoolean("final");

                if(finished) {
                    stop();
                } else {
                    // Transcript update
                    for (WatsonListener observer : observers) {
                        observer.onMessage(confidence, transcript);
                    }
                }
            } else if(data.has("state")) {
                // Ready to listen
                for(WatsonListener observer:observers) {
                    observer.onListen();
                }
            }
        } catch (JSONException jsone) {
            jsone.printStackTrace();
        }
    }

    @Override
    public void onAmplitude(double amplitude, double volume) {;}
}
