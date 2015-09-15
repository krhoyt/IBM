package ibm.us.com.chat;

import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

public class ChatMessage {
    public static final String ACTION_CREATE = "create_chat";
    public static final String ACTION_HISTORY = "read_all_chat";

    public static final String KEY_ACTION = "action";
    public static final String KEY_BLUE = "blue";
    public static final String KEY_CLIENT = "client";
    public static final String KEY_CSS = "css";
    public static final String KEY_GREEN = "green";
    public static final String KEY_MESSAGE = "message";
    public static final String KEY_RED = "red";

    public int      blue;
    public int      green;
    public int      red;
    public String   action;
    public String   client;
    public String   css;
    public String   message;

    public String toJSON() {
        JSONObject  json = null;

        try {
            json = new JSONObject();
            json.put(KEY_ACTION, action);

            if(action.equals(ACTION_CREATE)) {
                json.put(KEY_BLUE, blue);
                json.put(KEY_CLIENT, client);
                json.put(KEY_CSS, css);
                json.put(KEY_GREEN, green);
                json.put(KEY_MESSAGE, message);
                json.put(KEY_RED, red);
            }
        } catch(JSONException jsone) {
            Log.d("JSON", jsone.getMessage());
        }

        return json.toString();
    }

    public ChatMessage() {;}
}
