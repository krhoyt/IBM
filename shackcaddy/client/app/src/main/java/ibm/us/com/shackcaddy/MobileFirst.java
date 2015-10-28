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

    public void current(float latitude, float longitude) {
        Request quick = new Request(
            BMSClient.getInstance().getBluemixAppRoute() + "/papi/weather/quick",
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

                    weather = data.getJSONObject("current");
                    observed = weather.getJSONObject("observation");
                    imperial = observed.getJSONObject("imperial");

                    forecast = data.getJSONObject("forecast");
                    days = forecast.getJSONArray("forecasts");
                    today = days.getJSONObject(0);

                    results = new Forecast();
                    results.icon =
                        BMSClient.getInstance().getBluemixAppRoute() +
                        "/public/weathericons/icon" +
                        observed.getInt("icon_code") +
                        ".png";
                    results.temperature = imperial.getInt("temp");
                    results.phrase = observed.getString("phrase_12char");

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

    public void forecast(final String place, final String dayOfWeek) {
        this.dayOfWeek = dayOfWeek;

        Request golf = new Request(
            BMSClient.getInstance().getBluemixAppRoute() + "/papi/golf",
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
                    data = new JSONObject(response.getResponseText());
                    forecast = data.getJSONObject("forecast");
                    range = forecast.getJSONArray("forecasts");

                    for(int r = 0; r < 7; r++) {
                        current = range.getJSONObject(r);
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

                        if(daily.dayOfWeek.equals(dayOfWeek)) {
                            Log.d("MOBILEFIRST", daily.golfCategory + " (" + daily.golfIndex + ")");

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
