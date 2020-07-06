package ibm.us.com.contentmanagement;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.widget.ImageView;
import android.widget.ListView;

import com.ibm.caas.CAASContentItem;
import com.ibm.caas.CAASContentItemsList;
import com.ibm.caas.CAASContentItemsRequest;
import com.ibm.caas.CAASDataCallback;
import com.ibm.caas.CAASErrorResult;
import com.ibm.caas.CAASService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ListActivity extends AppCompatActivity {

    private ArrayList<CAASContentItem>  results;
    private CAASService                 service;
    private ContentAdapter              adapter;
    private Instance                    instance;

    private ListView                    lstContent;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_list);

        // Extras
        Bundle extras = getIntent().getExtras();
        instance = extras.getParcelable("instance");
        Log.d("LIST", instance.name);

        // MACM
        service = new CAASService(
            instance.server,
            instance.root,
            instance.name,
            instance.user,
            instance.password
        );

        // User interface
        ImageView imgBack = (ImageView)findViewById(R.id.image_back);
        lstContent = (ListView)findViewById(R.id.list_content);

        // Back
        imgBack.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        CAASContentItemsRequest request = new CAASContentItemsRequest(new CAASDataCallback<CAASContentItemsList>() {
            @Override
            public void onSuccess(CAASContentItemsList list) {
                List<CAASContentItem> items = list.getContentItems();

                Log.d("QUERY", "Found " + items.size() + " items.");

                // List
                results = new ArrayList<>(items);
                adapter = new ContentAdapter(getApplicationContext(), results);
                lstContent.setAdapter(adapter);
                adapter.notifyDataSetChanged();
            }

            @Override
            public void onError(CAASErrorResult error) {
                Log.d("QUERY", error.getMessage());
            }
        });

        // Path
        String path = extras.getString("path");
        request.setPath(path);

        // Size
        int size = extras.getInt("size");
        request.setPageSize(size);

        // Page
        int page = extras.getInt("number");
        request.setPageNumber(page);

        // Sort
        String[] parts;
        String sort = extras.getString("sort");

        if(sort.trim().length() > 0) {
            parts = sort.split(",");

            for(String part1 : parts) {
                ListPart part = new ListPart(part1);
                request.addSortDescriptor(part.key, part.ascending);
            }
        }

        // Keywords
        String keywords = extras.getString("keywords");

        if(keywords.trim().length() > 0) {
            parts = keywords.split(",");

            for(String part : parts) {
                request.addAnyKeywords(part.trim());
            }
        }

        // Categories
        String categories = extras.getString("categories");

        if(categories.trim().length() > 0) {
            parts = categories.split(",");

            for(String part : parts) {
                request.addAnyCategories(part.trim());
            }
        }

        // Properties
        String properties = extras.getString("properties");

        if(properties.trim().length() > 0) {
            parts = properties.split(",");

            for(String part : parts) {
                request.addProperties(part.trim());
            }
        }

        // Elements
        String elements = extras.getString("elements");

        if(elements.trim().length() > 0) {
            parts = elements.split(",");

            for(String part : parts) {
                request.addElements(part.trim());
            }
        }

        // Query
        service.executeRequest(request);
    }

}
