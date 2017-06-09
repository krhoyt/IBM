package ibm.us.com.contentmanagement;

import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;

public class QueryActivity extends AppCompatActivity {

    private Instance    instance;

    private EditText    txtCategories;
    private EditText    txtElements;
    private EditText    txtKeywords;
    private EditText    txtNumber;
    private EditText    txtPath;
    private EditText    txtProperties;
    private EditText    txtSize;
    private EditText    txtSort;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_query);

        // Reference server
        Bundle extras = getIntent().getExtras();
        instance = extras.getParcelable("instance");
        Log.d("QUERY", instance.name);

        // User interface
        ImageView imgBack = (ImageView)findViewById(R.id.image_back);
        TextView txtCancel = (TextView)findViewById(R.id.text_cancel);
        TextView txtFind = (TextView)findViewById(R.id.text_find);

        txtCategories = (EditText)findViewById(R.id.edit_categories);
        txtElements = (EditText)findViewById(R.id.edit_elements);
        txtKeywords = (EditText)findViewById(R.id.edit_keywords);
        txtNumber = (EditText)findViewById(R.id.edit_number);
        txtPath = (EditText)findViewById(R.id.edit_path);
        txtProperties = (EditText)findViewById(R.id.edit_properties);
        txtSize = (EditText)findViewById(R.id.edit_size);
        txtSort = (EditText)findViewById(R.id.edit_sort);

        // Back
        imgBack.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        // Cancel
        txtCancel.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        // Query
        txtFind.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                int     intPage;
                int     intSize;
                Intent  intent = new Intent(QueryActivity.this, ListActivity.class);
                String  strPage;
                String  strSize;

                // Page size
                strSize = txtSize.getText().toString();

                if(strSize.trim().length() > 0) {
                    intSize = Integer.valueOf(strSize);
                } else {
                    intSize = 100;
                }

                // Page number
                strPage = txtNumber.getText().toString();

                if(strPage.trim().length() > 0) {
                    intPage = Integer.valueOf(strPage);
                } else {
                    intPage = 1;
                }

                // Query details
                intent.putExtra("instance", instance);
                intent.putExtra("path", txtPath.getText().toString().trim());
                intent.putExtra("size", intSize);
                intent.putExtra("number", intPage);
                intent.putExtra("sort", txtSort.getText().toString().trim());
                intent.putExtra("keywords", txtKeywords.getText().toString().trim());
                intent.putExtra("categories", txtCategories.getText().toString().trim());
                intent.putExtra("properties", txtProperties.getText().toString().trim());
                intent.putExtra("elements", txtElements.getText().toString().trim());

                // Send to query screen
                startActivity(intent);
            }
        });
    }

}
