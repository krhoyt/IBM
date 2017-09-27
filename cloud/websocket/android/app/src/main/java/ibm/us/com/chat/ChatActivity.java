package ibm.us.com.chat;

import android.graphics.Color;
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

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;

import de.tavendo.autobahn.WebSocketConnection;
import de.tavendo.autobahn.WebSocketException;
import de.tavendo.autobahn.WebSocketHandler;

public class ChatActivity extends AppCompatActivity {
    private static final String         BLUEMIX = "ws://sockets.mybluemix.net:80";
    private static final String         CLIENT_PREFIX = "chat_";
    private static final String         KEY_DATA = "data";
    private static final String         KEY_PAYLOAD = "payload";

    private final WebSocketConnection   socket = new WebSocketConnection();

    private int                         blue;
    private int                         green;
    private int                         red;
    private String                      client;

    private ArrayList<ChatMessage>      items;
    private ChatAdapter                 adapter;

    private EditText                    txtContent;
    private ListView                    lstHistory;

    private WeakHandler                 handler;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chat);

        // Client ID
        client = CLIENT_PREFIX + System.currentTimeMillis();

        // Identifying color
        red = (int)Math.round(Math.random() * 255);
        green = (int)Math.round(Math.random() * 255);
        blue = (int)Math.round(Math.random() * 255);

        // Handler
        handler = new WeakHandler(new Handler.Callback() {
            @Override
            public boolean handleMessage(Message message) {
                Bundle      bundle;
                ChatMessage chat;
                JSONArray   history;
                JSONObject  data;
                JSONObject  item;

                bundle = message.getData();

                try {
                    // JSON object
                    data = new JSONObject(bundle.getString(KEY_PAYLOAD));

                    // Evaluate action
                    switch(data.getString(ChatMessage.KEY_ACTION)) {
                        // Whole history
                        case ChatMessage.ACTION_HISTORY:
                            history = data.getJSONArray(KEY_DATA);

                            for(int h = 0; h < history.length(); h++) {
                                item = history.getJSONObject(h);

                                chat = new ChatMessage();
                                chat.client = item.getString(ChatMessage.KEY_CLIENT);
                                chat.red = item.getInt(ChatMessage.KEY_RED);
                                chat.green = item.getInt(ChatMessage.KEY_GREEN);
                                chat.blue = item.getInt(ChatMessage.KEY_BLUE);
                                chat.message = item.getString(ChatMessage.KEY_MESSAGE);

                                items.add(chat);
                            }

                            break;

                        // Single item
                        case ChatMessage.ACTION_CREATE:
                            item = data.getJSONObject(KEY_DATA);

                            chat = new ChatMessage();
                            chat.client = item.getString(ChatMessage.KEY_CLIENT);
                            chat.red = item.getInt(ChatMessage.KEY_RED);
                            chat.green = item.getInt(ChatMessage.KEY_GREEN);
                            chat.blue = item.getInt(ChatMessage.KEY_BLUE);
                            chat.message = item.getString(ChatMessage.KEY_MESSAGE);

                            items.add(chat);

                            break;
                    }
                } catch(JSONException jsone) {
                    jsone.printStackTrace();
                }

                // Update render
                adapter.notifyDataSetChanged();

                // Scroll to bottom
                // Most recent message
                lstHistory.smoothScrollToPosition(adapter.getCount() - 1);

                return false;
            }
        });

        // List
        items = new ArrayList<>();
        adapter = new ChatAdapter(this, items);

        lstHistory = (ListView)findViewById(R.id.list_history);
        lstHistory.setAdapter(adapter);

        // Text field
        txtContent = (EditText) findViewById(R.id.edit_message);
        txtContent.setTextColor(Color.rgb(
            red,
            green,
            blue
        ));
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
                        chat.action = ChatMessage.ACTION_CREATE;
                        chat.client = client;
                        chat.red = red;
                        chat.green = green;
                        chat.blue = blue;
                        chat.message = txtContent.getText().toString();
                        chat.css = "rgb( " + red + ", " + green + ", " + blue + " )";

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
                    ChatMessage chat;

                    // Debug
                    Log.d("WEBSOCKETS", "Connected to server.");

                    // Message for chat history
                    chat = new ChatMessage();
                    chat.action = ChatMessage.ACTION_HISTORY;

                    // Send request
                    socket.sendTextMessage(chat.toJSON());
                }

                @Override
                public void onTextMessage(String payload) {
                    Bundle      bundle;
                    Message     message;

                    Log.d("WEBSOCKETS", payload);

                    bundle = new Bundle();
                    bundle.putString(KEY_PAYLOAD, payload);

                    message = new Message();
                    message.setData(bundle);

                    handler.sendMessage(message);
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
