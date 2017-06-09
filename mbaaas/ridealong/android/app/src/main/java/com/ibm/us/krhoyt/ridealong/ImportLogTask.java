package com.ibm.us.krhoyt.ridealong;

import android.app.ProgressDialog;
import android.content.Context;
import android.os.AsyncTask;
import android.util.Log;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.GregorianCalendar;

import io.realm.Realm;

public class ImportLogTask extends AsyncTask<String, Integer, Integer> {

    private ProgressDialog  progress;
    private Context         context;
    private int             count;

    public ImportLogTask(Context context, int count) {
        this.context = context;
        this.count = count;
    }

    @Override
    protected void onPreExecute() {
        super.onPreExecute();

        progress = new ProgressDialog(context);
        progress.setTitle("Import");
        progress.setMessage("Loading data file ...");
        progress.setIndeterminate(false);
        progress.setMax(100);
        progress.setProgressStyle(ProgressDialog.STYLE_HORIZONTAL);
        progress.setCancelable(false);
        progress.setCanceledOnTouchOutside(false);
        progress.show();
    }

    @Override
    protected Integer doInBackground(String... urls) {
        BufferedReader input = null;
        String line = null;
        String[] parts;
        int lines = 0;
        long now = System.currentTimeMillis();
        Route route;

        Realm realm = Realm.getInstance(context);

        try {
            URL url = new URL(urls[1]);

            input = new BufferedReader(new InputStreamReader(url.openStream()));

            while ((line = input.readLine()) != null) {
                line = line.trim();

                if (line.length() > 0) {
                    if (line.indexOf("RMC") > 0) {
                        parts = line.split(",");

                        realm.beginTransaction();
                        Location location = realm.createObject(Location.class);
                        location.setRouteId(now);
                        location.setCreatedAt(parseDateTime(parts[9] + " " + parts[1]));
                        location.setLatitude(parseDegrees(parts[3], parts[4]));
                        location.setLongitude(parseDegrees(parts[5], parts[6]));
                        location.setSpeed(Double.parseDouble(parts[7]));
                        location.setBearing(Double.parseDouble(parts[8]));
                        realm.commitTransaction();

                        lines = lines + 1;
                        publishProgress(lines);
                    }
                }
            }
        } catch (IOException ioe) {
            ioe.printStackTrace();
        } finally {
            if (input != null) {
                try {
                    input.close();
                } catch (IOException ioe) {
                    ioe.printStackTrace();
                }
            }
        }

        realm.beginTransaction();
        route = realm.createObject(Route.class);
        route.setCreatedAt(now);
        route.setName(urls[0]);
        realm.commitTransaction();

        realm.close();

        return lines;
    }

    @Override
    protected void onPostExecute(Integer lines) {
        Log.d("IMPORT", lines + " lines found.");
        progress.dismiss();
    }

    @Override
    protected void onProgressUpdate(Integer... values) {
        super.onProgressUpdate();

        int percent = (int)(((float)values[0] / (float)count) * 100.0);
        progress.setProgress(percent);
    }

    private long parseDateTime(String utc) {
        int day = Integer.parseInt(utc.substring(0, 2));
        int month = Integer.parseInt(utc.substring(2, 4));
        int year = Integer.parseInt(utc.substring(4, 6)) + 2000;
        int hour = Integer.parseInt(utc.substring(7, 9));
        int minute = Integer.parseInt(utc.substring(9, 11));
        int second = Integer.parseInt(utc.substring(11, 13));
        GregorianCalendar calendar = new GregorianCalendar(year, month, day, hour, minute, second);

        return calendar.getTimeInMillis();
    }

    public double trunc(double d) {
        return (double)((long)d);
    }

    private double parseDegrees(String dms, String compass) {
        double minutes;
        double degrees;
        double result;
        double convert = Double.parseDouble(dms);

        degrees = trunc(convert / 100.0);
        minutes = convert - (degrees * 100.0);
        result = degrees + minutes / 60.0;

        if (compass.equals("S") || compass.equals("W")) {
           result = 0 - result;
        }

        return result;
    }

}
