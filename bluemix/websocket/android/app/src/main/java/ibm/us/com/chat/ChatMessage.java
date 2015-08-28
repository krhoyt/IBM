package ibm.us.com.chat;

import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.UUID;

public class ChatMessage {
    private static final String AVATAR_PATH = "/avatar/hdc.svg";
    private static final String CHAT_PREFIX = "chat_";

    public static final String KEY_AVATAR = "avatar";
    public static final String KEY_CLIENT = "client";
    public static final String KEY_CONTENT = "content";
    public static final String KEY_ECHO = "echo";
    public static final String KEY_TIMESTAMP = "timestamp";

    private boolean echo;
    private Double  latitude;
    private Double  longitude;
    private Long    timestamp;
    private String  avatar;
    private String  client;
    private String  content;
    private String  image;

    public String toJSON() {
        JSONObject  json = null;

        try {
            json = new JSONObject();
            json.put(KEY_AVATAR, avatar);
            json.put(KEY_CLIENT, CHAT_PREFIX + client);
            json.put(KEY_CONTENT, content);
            json.put(KEY_ECHO, echo);
            json.put(KEY_TIMESTAMP, timestamp);
        } catch(JSONException jsone) {
            Log.d("JSON", jsone.getMessage());
        }

        return json.toString();
    }

    public ChatMessage() {
        String  id;

        avatar = AVATAR_PATH;
        timestamp = System.currentTimeMillis();
        echo = true;

        id = UUID.randomUUID().toString();
        id = id.replace("-", "");
        this.client = id;
    }

    public boolean isEcho() {
        return echo;
    }

    public void setEcho(boolean echo) {
        this.echo = echo;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getClient() {
        return client;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
}
