package ibm.us.com.shackcaddy;

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
    private ArrayList<MobileFirstListener>  observers;
    private String                          dayOfWeek;

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
            BMSClient.getInstance().getBluemixAppRoute() + "/api/weather/quick",
            Request.GET
        );
        quick.setQueryParameter("latitude", String.valueOf(latitude));
        quick.setQueryParameter("longitude", String.valueOf(longitude));
        quick.send(new ResponseListener() {
            @Override
            public void onSuccess(Response response) {
                Forecast    results;
                JSONArray   days;
                JSONObject  data;
                JSONObject  weather;
                JSONObject  forecast;
                JSONObject  observed;
                JSONObject  imperial;
                JSONObject  today;

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
                    results = new Forecast();
                    results.icon =
                        BMSClient.getInstance().getBluemixAppRoute() +
                        "/public/weathericons/icon" +
                        observed.getInt("icon_code") +
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
                    results.windCardinal = observed.getString("wdir_cardinal");
                    results.windSpeed = imperial.getInt("wspd");
                    results.uvIndex = observed.getInt("uv_index");
                    results.uvDescription = observed.getString("uv_desc");
                    results.sunrise = observed.getString("sunrise");
                    results.sunset = observed.getString("sunset");

                    for(MobileFirstListener observer:observers) {
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

    // Full forecasts from Weather Insights
    public void forecast(final String place, final String dayOfWeek) {
        // Keep around for Watson to speak
        this.dayOfWeek = dayOfWeek;

        // Protected (authenticated) resource
        Request golf = new Request(
            BMSClient.getInstance().getBluemixAppRoute() + "/api/golf",
            Request.GET
        );
        golf.setQueryParameter("place", place);
        golf.send(new ResponseListener() {
            @Override
            public void onSuccess(Response response) {
                Forecast    daily;
                JSONArray   range;
                JSONObject  current;
                JSONObject  data;
                JSONObject  day;
                JSONObject  forecast;

                try {
                    // Pertinent objects
                    data = new JSONObject(response.getResponseText());
                    forecast = data.getJSONObject("forecast");
                    range = forecast.getJSONArray("forecasts");

                    // Find matching day
                    for(int r = 0; r < 7; r++) {
                        current = range.getJSONObject(r);

                        // Populate forecast
                        daily = new Forecast();

                        daily.place = place;
                        daily.dayOfWeek = current.getString("dow");
                        daily.minimum = current.getInt("min_temp");

                        if(r > 0) {
                            daily.maximum = current.getInt("max_temp");
                            daily.sunrise = current.getString("sunrise");
                            daily.sunset = current.getString("sunset");

                            day = current.getJSONObject("day");

                            daily.golfCategory = day.getString("golf_category");
                            daily.golfIndex = day.getInt("golf_index");
                            daily.icon =
                                BMSClient.getInstance().getBluemixAppRoute() +
                                "/public/weathericons/icon" +
                                day.getInt("icon_code") +
                                ".png";
                            daily.phrase = day.getString("phrase_12char");
                            daily.uvDescription = day.getString("uv_desc");
                            daily.uvIndex = day.getInt("uv_index");
                            daily.windCardinal = day.getString("wdir_cardinal");
                            daily.windSpeed = day.getInt("wspd");
                        }

                        // Found match
                        if(daily.dayOfWeek.equals(dayOfWeek)) {
                            Log.d("MOBILEFIRST", daily.golfCategory + " (" + daily.golfIndex + ")");

                            // Inform listeners
                            for(MobileFirstListener observer:observers) {
                                observer.onForecast(daily);
                            }

                            break;
                        }
                    }
                } catch(JSONException jsone) {
                    jsone.printStackTrace();
                }
            }

            @Override
            public void onFailure(Response response, Throwable throwable, JSONObject json) {
                Log.d("MOBILEFIRST", "Fail: " + response.getResponseText());
            }
        });
    }

    public void setMobileFirstListener(MobileFirstListener observer) {
        observers.add(observer);
    }
}
