package ibm.us.com.fashionx;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.BitmapDrawable;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ImageView;

import com.ibm.caas.CAASAssetRequest;
import com.ibm.caas.CAASDataCallback;
import com.ibm.caas.CAASErrorResult;

import java.util.ArrayList;

public class CatalogActivity extends AppCompatActivity {

    private MobileContent content;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_catalog);

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
            public void onCatalog(ArrayList<CatalogItem> departments) {
                Log.d("CATALOG", "Got " + departments.size() + " departments.");
            }

            @Override
            public void onAdvertise(String path, String body) {
                ;
            }

            @Override
            public void onSuggest(String path) {
                ;
            }
        });
        content.catalog();
    }

}
