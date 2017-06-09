package ibm.us.com.fashionx;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.BitmapDrawable;
import android.os.Message;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.TextView;

import com.ibm.caas.CAASAssetRequest;
import com.ibm.caas.CAASDataCallback;
import com.ibm.caas.CAASErrorResult;

import java.util.ArrayList;

public class NavigateActivity extends AppCompatActivity {

    private MobileContent content;

    private FrameLayout layAd;
    private ImageView   imgAd;
    private TextView    txtBody;
    private TextView    txtShadow;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_navigate);

        // User interface
        layAd = (FrameLayout) findViewById(R.id.layout_ad);
        imgAd = (ImageView) findViewById(R.id.image_ad);
        txtBody = (TextView) findViewById(R.id.text_ad);
        txtShadow = (TextView) findViewById(R.id.text_shadow);

        // Back
        ImageView imgBack = (ImageView) findViewById(R.id.image_back);
        imgBack.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        // Mobile Content
        content = new MobileContent(
            getApplicationContext().getString(R.string.macm_server),
            getApplicationContext().getString(R.string.macm_context),
            getApplicationContext().getString(R.string.macm_instance),
            getApplicationContext().getString(R.string.macm_user),
            getApplicationContext().getString(R.string.macm_password)
        );
        content.setMobileContentListener(new MobileContentListener() {
            @Override
            public void onAdvertise(String path, String body) {
                Log.d("NAVIGATE", path);

                CAASDataCallback<byte[]> callback = new CAASDataCallback<byte[]>() {
                    @Override
                    public void onSuccess(byte[] bytes) {
                        Bitmap bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
                        BitmapDrawable drawable = new BitmapDrawable(
                            getApplicationContext().getResources(),
                            bitmap
                        );
                        imgAd.setImageDrawable(drawable);
                    }

                    @Override
                    public void onError(CAASErrorResult error) {
                        Log.e("CAAS", "Image failed: " + error);
                    }
                };
                CAASAssetRequest request = new CAASAssetRequest(path, callback);
                content.getService().executeRequest(request);

                txtBody.setText(body);
                txtShadow.setText(body);

                layAd.setVisibility(View.VISIBLE);
            }

            @Override
            public void onSuggest(String path) {
                ;
            }

            @Override
            public void onCatalog(ArrayList<CatalogItem> departments) {
                ;
            }
        });
        content.advertise(getString(R.string.advertisement_sample));
    }

}
