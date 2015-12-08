package com.ibm.us.krhoyt.ridealong;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;

import com.pubnub.api.Callback;
import com.pubnub.api.Pubnub;
import com.pubnub.api.PubnubException;

public class RecordActivity extends AppCompatActivity {

    private Pubnub  pubnub;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_record);

        pubnub = new Pubnub(
            getString(R.string.publish_key),
            getString(R.string.subscribe_key)
        );

        try {
            pubnub.subscribe("channel-ridealong", new Callback() {
                @Override
                public void successCallback(String channel, Object message) {
                    super.successCallback(channel, message);
                    Log.d("RECORD", message.toString());
                }
            });
        } catch (PubnubException pne) {
            pne.printStackTrace();
        }
    }
}
