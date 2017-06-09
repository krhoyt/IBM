package ibm.us.com.fashionx;

import android.content.Context;
import android.util.Log;

import com.ibm.mobilefirstplatform.clientsdk.android.core.api.BMSClient;
import com.ibm.mobilefirstplatform.clientsdk.android.core.api.Request;
import com.ibm.mobilefirstplatform.clientsdk.android.core.api.Response;
import com.ibm.mobilefirstplatform.clientsdk.android.core.api.ResponseListener;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.MalformedURLException;
import java.util.ArrayList;

public class MobileFirst {

    private ArrayList<MobileFirstListener> observers;

    public MobileFirst(Context context) {
        observers = new ArrayList<>();

        // Authenticate mobile client access (MCA)
        try {
            BMSClient.getInstance().initialize(
                context,
                context.getString(R.string.bluemix_route),
                context.getString(R.string.bluemix_guid)
            );
        } catch(MalformedURLException murle) {
            murle.printStackTrace();
        }
    }

    // Current conditions from Weather Insights
    public void current(float latitude, float longitude) {
        // Protected (authenticated resource)
        Request quick = new Request(
            BMSClient.getInstance().getBluemixAppRoute() + "/api/weather",
            Request.GET
        );
        quick.setQueryParameter("latitude", String.valueOf(latitude));
        quick.setQueryParameter("longitude", String.valueOf(longitude));
        quick.send(new ResponseListener() {
            @Override
            public void onSuccess(Response response) {
                JSONArray           days;
                JSONObject          data;
                JSONObject          weather;
                JSONObject          forecast;
                JSONObject          observed;
                JSONObject          imperial;
                JSONObject          today;
                MobileFirstWeather  results;

                try {
                    data = new JSONObject(response.getResponseText());

                    // Get pertinent objects
                    weather = data.getJSONObject("current");
                    observed = weather.getJSONObject("observation");
                    imperial = observed.getJSONObject("imperial");

                    forecast = data.getJSONObject("forecast");
                    days = forecast.getJSONArray("forecasts");
                    today = days.getJSONObject(0);

                    // Populate weather results
                    results = new MobileFirstWeather();
                    results.icon = observed.getInt("icon_code");
                    results.path =
                        BMSClient.getInstance().getBluemixAppRoute() +
                        "/public/weathericons/icon" +
                        results.icon +
                        ".png";
                    results.temperature = imperial.getInt("temp");
                    results.phrase = observed.getString("phrase_12char");

                    // Maximum may be null after peak of day
                    if(today.isNull("max_temp")) {
                        results.maximum = 9999;
                    } else {
                        results.maximum = today.getInt("max_temp");
                    }

                    results.minimum = today.getInt("min_temp");

                    for(MobileFirstListener observer : observers) {
                        observer.onCurrent(results);
                    }
                } catch(JSONException jsone) {
                    jsone.printStackTrace();
                }
            }

            @Override
            public void onFailure(Response response, Throwable t, JSONObject extendedInfo) {
                Log.d("MOBILEFIRST", "Fail: " + response.getResponseText());
            }
        });
    }

    public void setMobileFirstListener(MobileFirstListener observer) {
        observers.add(observer);
    }

}
