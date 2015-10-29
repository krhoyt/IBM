package ibm.us.com.shackcaddy;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.AsyncTask;
import android.util.Log;
import android.widget.ImageView;

import java.io.InputStream;
import java.net.URL;

public class DownloadTask extends AsyncTask<String, Void, Bitmap> {

    private ImageView   view = null;

    // ImageView target
    public DownloadTask(ImageView view) {
        this.view = view;
    }

    // Download image in own thread
    protected Bitmap doInBackground(String... urls) {
        Bitmap      bitmap = null;
        InputStream input = null;
        String      url = null;

        url = urls[0];

        try {
            input = new URL(url).openStream();
            bitmap = BitmapFactory.decodeStream(input);
        } catch(Exception e) {
            Log.d("DOWNLOAD", e.getMessage());
            e.printStackTrace();
        }

        return bitmap;
    }

    // Put downloaded image into ImageView
    protected void onPostExecute(Bitmap result) {
        view.setImageBitmap(result);
    }
}
