package ibm.us.com.hellomobilefirst;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.os.Handler;
import android.os.Message;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;

import com.badoo.mobile.util.WeakHandler;
import com.worklight.wlclient.api.WLClient;
import com.worklight.wlclient.api.WLFailResponse;
import com.worklight.wlclient.api.WLResourceRequest;
import com.worklight.wlclient.api.WLResponse;
import com.worklight.wlclient.api.WLResponseListener;

import java.net.URI;
import java.net.URISyntaxException;

public class HelloActivity extends AppCompatActivity
{
    public static final String KEY_HELLO = "hello";
    public static final String SERVICE_HELLO = "/adapters/HelloAdapter/hello/";

    private WeakHandler handler;
    private WLClient    client;

    private Button      btnHello;
    private EditText    txtName;

    private boolean     connected;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_hello);

        // Connection to MobileFirst
        connected = false;

        // Field containing user name
        txtName = (EditText)findViewById(R.id.edit_name);

        // Button to call for greeting
        btnHello = (Button)findViewById(R.id.button_hello);
        btnHello.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                URI                 path;
                WLResourceRequest   request;

                Log.d("BUTTON", connected ? "Is connected." : "Is not connected.");

                // Connected to MobileFirst
                if(connected) {
                    try {
                        // Invoke service
                        // REST GET
                        path = new URI(SERVICE_HELLO + txtName.getText().toString().trim());
                        request = new WLResourceRequest(path, WLResourceRequest.GET);
                        request.send(new WLResponseListener() {
                            @Override
                            public void onSuccess(WLResponse response) {
                                Bundle  bundle;
                                Message message;

                                Log.i("MOBILEFIRST", "Success: " + response.getResponseText());

                                // Marshal data
                                bundle = new Bundle();
                                bundle.putString(KEY_HELLO, response.getResponseText());

                                // Put data into message
                                message = new Message();
                                message.setData(bundle);

                                // Send to UI thread
                                handler.sendMessage(message);
                            }

                            @Override
                            public void onFailure(WLFailResponse response) {
                                Log.i("MOBILEFIRST", "Fail: " + response.getErrorMsg());
                            }
                        });
                    } catch(URISyntaxException urise) {
                        Log.d("MOBILEFIRST", "URL: " + urise.getMessage());
                    }
                }
            }
        });

        // Handler for service response
        // Communicate with UI thread
        handler = new WeakHandler(new Handler.Callback() {
            @Override
            public boolean handleMessage(Message message) {
                AlertDialog dialog;
                Bundle      data;

                // Data from message
                data = message.getData();

                // Show data in alert dialog
                dialog = new AlertDialog.Builder(HelloActivity.this).create();
                dialog.setTitle(getString(R.string.mobile_first));
                dialog.setMessage(data.getString(KEY_HELLO));
                dialog.setButton(
                        AlertDialog.BUTTON_NEUTRAL,
                        getString(R.string.ok_label),
                        new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int which) {
                                dialog.dismiss();
                            }
                        }
                );
                dialog.show();

                return false;
            }
        });

        // MobileFirst service client
        // Used to invoke services
        client = WLClient.createInstance(this);

        // Connect to MobileFirst
        client.connect(new WLResponseListener() {
            @Override
            public void onSuccess(WLResponse response) {
                Log.i("MOBILEFIRST", "Connected to MobileFirst.");
                connected = true;
            }

            @Override
            public void onFailure(WLFailResponse response) {
                Log.i("MOBILEFIRST", "Failed connected to MobileFirst.");
            }
        });
    }
}
