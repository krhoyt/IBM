package ibm.us.com.fashionfinder;

public interface WeatherListener {
    void onConnect();
    void onMessage(String payload);
    void onSubscribe();
}
