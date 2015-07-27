package ibm.us.com.weather;

import android.graphics.Point;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.DisplayMetrics;
import android.util.TypedValue;
import android.view.Display;
import android.widget.ImageView;
import android.widget.TextView;

public class MainActivity extends AppCompatActivity {

    protected ImageView imgIcon = null;
    protected ImageView imgScene = null;
    protected TextView  txtCurrent = null;
    protected TextView  txtLocation = null;
    protected TextView  txtRange = null;
    protected TextView  txtSummary = null;

    @Override
    protected void onCreate( Bundle savedInstanceState ) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Display display = getWindowManager().getDefaultDisplay();
        Point size = new Point();
        display.getSize(size);

        DisplayMetrics metrics = new DisplayMetrics();
        getWindowManager().getDefaultDisplay().getMetrics(metrics);

        float scale = getResources().getDisplayMetrics().density;

        txtCurrent = ( TextView )findViewById( R.id.text_current );
        txtLocation = ( TextView )findViewById( R.id.text_location );
        txtRange = ( TextView )findViewById( R.id.text_range );
        txtSummary = ( TextView )findViewById( R.id.text_summary );
    }

}
