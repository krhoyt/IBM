package ibm.us.com.fashionfinder;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.ImageView;

public class FashionActivity extends AppCompatActivity {

    private FrameLayout         laySuggest;
    private ImageView           imgSuggest;
    private ImageView           imgGlasses;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_fashion);

        imgGlasses = (ImageView)findViewById(R.id.image_glasses);
        imgGlasses.setTag("NORMAL");
        imgGlasses.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (imgGlasses.getTag().toString().equals("NORMAL")) {
                    imgGlasses.setImageResource(R.drawable.glasses_xray);
                    imgGlasses.setTag("XRAY");
                    int count = laySuggest.getChildCount();
                    for (int c = 0; c < count; c++) {
                        View child = laySuggest.getChildAt(c);
                        if(child.getTag() != null) {
                            if(child.getTag().toString().equals("TIP")) {
                                child.setVisibility(View.VISIBLE);
                            }
                        }
                    }
                } else {
                    imgGlasses.setImageResource(R.drawable.glasses_normal);
                    imgGlasses.setTag("NORMAL");
                    int count = laySuggest.getChildCount();
                    for (int c = 0; c < count; c++) {
                        View child = laySuggest.getChildAt(c);
                        if(child.getTag() != null) {
                            if(child.getTag().toString().equals("TIP")) {
                                child.setVisibility(View.INVISIBLE);
                            }
                        }
                    }
                }
            }
        });

        laySuggest = (FrameLayout)findViewById(R.id.frame_suggest);

        // 960 x 640
        imgSuggest = (ImageView)findViewById(R.id.image_suggest);
        imgSuggest.post(new Runnable() {
            @Override
            public void run() {
                createTip(906.0, 640.0, 515.0, 581.0);
            }
        });
    }

    private void createTip(double pixel_width, double pixel_height, double place_left, double place_top) {
        double view_width;
        double view_height;
        double drawable_width;
        double drawable_height;
        double scaled_width;
        double scaled_height;
        double centered;
        double offset_left;
        double offset_top;
        double tip_radius;
        float tip_diameter;
        int final_left;
        int final_top;
        FrameLayout.MarginLayoutParams margins;
        FrameLayout.LayoutParams layout;
        ImageView imgTip;

        // Density
        // Pixels to DP
        tip_diameter = TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            40,
            getResources().getDisplayMetrics()
        );

        // Tip radius
        tip_radius = (double) tip_diameter / 2;
        Log.i("TIP_RADIUS", Double.toString(tip_radius));

        // View
        view_width = (double) imgSuggest.getWidth();
        view_height = (double) imgSuggest.getHeight();
        Log.i("TIP_VIEW", view_width + ", " + view_height);

        // Drawable
        drawable_width = (double) imgSuggest.getDrawable().getBounds().width();
        drawable_height = (double) imgSuggest.getDrawable().getBounds().height();
        Log.i("TIP_DRAWABLE", drawable_width + ", " + drawable_height);

        // Scale drawable
        scaled_width = (drawable_width / drawable_height) * view_height;
        scaled_height = view_height;
        Log.i("TIP_SCALED", scaled_width + ", " + scaled_height);

        // Center offset
        centered = (scaled_width - view_width) / 2;
        Log.i("TIP_CENTER", Double.toString(centered));

        // Desired offset
        double percentage_left = place_left / pixel_width;
        double percentage_top = place_top / pixel_height;
        Log.i("TIP_PERCENTAGE", percentage_left + ", " + percentage_top);

        // Calculated offset
        offset_left = (percentage_left * scaled_width) - centered;
        offset_top = percentage_top * scaled_height;
        Log.i("TIP_OFFSET", offset_left + ", " + offset_top);

        // Center tip
        final_left = (int) (offset_left - tip_radius);
        final_top = (int) (offset_top - tip_radius);
        Log.i("TIP_FINAL", final_left + ", " + final_top);

        // Construct tip
        layout = new FrameLayout.LayoutParams((int) tip_diameter, (int) tip_diameter);

        imgTip = new ImageView(getBaseContext());
        imgTip.setLayoutParams(layout);
        imgTip.setBackgroundResource(R.drawable.suggest_circle);
        imgTip.setTag("TIP");

        if(imgGlasses.getTag().toString().equals("NORMAL")) {
            imgTip.setVisibility(View.INVISIBLE);
        }

        // Add to layout
        laySuggest.addView(imgTip);

        // Position
        margins = (FrameLayout.MarginLayoutParams) imgTip.getLayoutParams();
        margins.setMargins(final_left, final_top, 0, 0);
    }

}
