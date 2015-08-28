package ibm.us.com.chat;

import android.os.Handler;
import android.os.Message;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.widget.EditText;
import android.widget.ListView;

import com.badoo.mobile.util.WeakHandler;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;

import de.tavendo.autobahn.WebSocketConnection;
import de.tavendo.autobahn.WebSocketException;
import de.tavendo.autobahn.WebSocketHandler;

public class ChatActivity extends AppCompatActivity {
    private static final String         BLUEMIX = "ws://sockets.mybluemix.net:80";

    private final WebSocketConnection   socket = new WebSocketConnection();

    private ArrayList<ChatMessage>      items;
    private ChatAdapter                 adapter;

    private EditText                    txtContent;

    private WeakHandler                 handler;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chat);

        // Handler
        handler = new WeakHandler(new Handler.Callback() {
            @Override
            public boolean handleMessage(Message message) {
                Bundle      bundle;
                ChatMessage chat;

                bundle = message.getData();

                chat = new ChatMessage();
                chat.setContent(bundle.getString(ChatMessage.KEY_CONTENT));

                items.add(chat);
                adapter.notifyDataSetChanged();

                return false;
            }
        });

        // List
        items = new ArrayList<>();
        adapter = new ChatAdapter(this, items);
        ListView lstHistory = (ListView)findViewById(R.id.list_history);
        lstHistory.setAdapter(adapter);

        // Text field
        txtContent = (EditText) findViewById(R.id.edit_content);
        txtContent.setOnKeyListener(new View.OnKeyListener() {
            @Override
            public boolean onKey(View v, int keyCode, KeyEvent event) {
                ChatMessage chat;

                // Send
                if((event.getAction() == KeyEvent.ACTION_DOWN) && (keyCode == KeyEvent.KEYCODE_ENTER)) {
                    // Message present
                    if(txtContent.getText().toString().trim().length() > 0) {
                        // Build message
                        chat = new ChatMessage();
                        chat.setContent(txtContent.getText().toString());

                        // Publish
                        socket.sendTextMessage(chat.toJSON());

                        // Clear field
                        txtContent.setText(null);
                    }
                }

                return false;
            }
        });

        // WebSockets
        try {
            socket.connect(BLUEMIX, new WebSocketHandler() {
                @Override
                public void onOpen() {
                    Log.d("WEBSOCKETS", "Connected to server.");
                }

                @Override
                public void onTextMessage(String payload) {
                    Bundle      bundle;
                    JSONObject  json;
                    Message     message;

                    Log.d("WEBSOCKETS", payload);

                    try {
                        json = new JSONObject(payload);

                        bundle = new Bundle();
                        bundle.putString(ChatMessage.KEY_CONTENT, json.getString(ChatMessage.KEY_CONTENT));

                        message = new Message();
                        message.setData(bundle);
                        handler.sendMessage(message);
                    } catch( JSONException jsone ) {
                        Log.d("WEBSOCKETS", jsone.getMessage());
                    }
                }

                @Override
                public void onClose(int code, String reason) {
                    Log.d("WEBSOCKETS", "Connection lost.");
                }
            });
        } catch(WebSocketException wse) {
            Log.d("WEBSOCKETS", wse.getMessage());
        }
    }
}
