package ibm.us.com.shackcaddy;

public interface WatsonListener {
    void onComplete(Double confidence, String content);
    void onListen();
    void onMessage(Double confidence, String content);
}
