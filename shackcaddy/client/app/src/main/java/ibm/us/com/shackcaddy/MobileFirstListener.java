package ibm.us.com.shackcaddy;

public interface MobileFirstListener {
    void onCurrent(Forecast current);
    void onForecast(Forecast forecast);
}
