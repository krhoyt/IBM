package ibm.us.com.contentmanagement;

import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.TextView;

import java.util.ArrayList;

public class SourceActivity extends AppCompatActivity {

    public static final int INTENT_ADD = 100;

    private ArrayList<Instance> list;
    private InstanceHelper      db;
    private SourceAdapter       adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_source);

        // User interface
        TextView txtNone = (TextView)findViewById(R.id.text_none);
        LinearLayout layAdd = (LinearLayout)findViewById(R.id.layout_add);
        ListView lstInstances = (ListView)findViewById(R.id.list_instances);

        // Database
        db = new InstanceHelper(this);

        if(db.count() == 0) {
            Log.d("SOURCE", "No records.");
            txtNone.setVisibility(View.VISIBLE);
        } else {
            Log.d("SOURCE", "Found " + db.count() + " records.");
            list = db.list();
            adapter = new SourceAdapter(this, list);
            lstInstances.setAdapter(adapter);
            adapter.notifyDataSetChanged();
            lstInstances.setVisibility(View.VISIBLE);
        }

        // List selection
        lstInstances.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Instance    instance = list.get(position);
                Intent      intent = new Intent(SourceActivity.this, QueryActivity.class);

                Log.d("SOURCE", instance.name);

                intent.putExtra("instance", instance);

                startActivity(intent);
            }
        });

        // Add instance
        // Move to details screen
        layAdd.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(SourceActivity.this, CreateActivity.class);
                startActivityForResult(intent, INTENT_ADD);
            }
        });
    }

    protected void onActivityResult(int request, int result, Intent data) {
        switch(request) {
            // Add record
            case INTENT_ADD:
                if(result == 0) {
                    Log.d("SOURCE", "Adding record to list.");

                    Instance instance = new Instance();

                    instance.name = data.getStringExtra("name");
                    instance.password = data.getStringExtra("password");
                    instance.server = data.getStringExtra("server");
                    instance.user = data.getStringExtra("user");
                    instance.root = data.getStringExtra("root");

                    list.add(instance);
                    adapter.notifyDataSetChanged();
                } else {
                    Log.d("SOURCE", "Add action cancelled.");
                }

                break;
        }
    }

}
