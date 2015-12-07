package com.ibm.us.krhoyt.ridealong;

import android.app.ProgressDialog;
import android.content.Intent;
import android.os.Bundle;
import android.support.design.widget.FloatingActionButton;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.View;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.AdapterView;
import android.widget.ListView;

import io.realm.Realm;
import io.realm.RealmResults;

public class MainActivity extends AppCompatActivity {

    private ProgressDialog  progress;
    private Realm           realm;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        FloatingActionButton fab = (FloatingActionButton) findViewById(R.id.fab);
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Snackbar.make(view, "Replace with your own action", Snackbar.LENGTH_LONG)
                        .setAction("Action", null).show();
            }
        });

        // RealmConfiguration config = new RealmConfiguration.Builder(this).build();
        // Realm.deleteRealm(config);

        realm = Realm.getInstance(this);
        RealmResults<Route> routes = realm.where(Route.class).findAll();

        // long route = routes.get(0).getCreatedAt();
        // Log.d("MAIN", "Route: " + route);

        /*
        RealmQuery<Location> query = realm.where(Location.class);
        query.equalTo("routeId", route);

        RealmResults<Location> locations = query.findAll();
        Log.d("MAIN", locations.size() + " points (742?).");
        */

        RouteAdapter adapter = new RouteAdapter(getApplicationContext(), routes, true);
        ListView lstRoutes = (ListView) findViewById(R.id.list_routes);
        lstRoutes.setAdapter(adapter);
        lstRoutes.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Route route = (Route)parent.getItemAtPosition(position);
                Log.d("MAIN", "Selected: " + route.getCreatedAt());

                Intent intent = new Intent(MainActivity.this, RouteActivity.class);
                intent.putExtra("routeId", route.getCreatedAt());

                startActivity(intent);
            }
        });
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();

        if (id == R.id.action_caltrain) {
            ImportLogTask importer;
            importer = new ImportLogTask(MainActivity.this, 742);
            importer.execute("Caltrain", "http://ridealong.mybluemix.net/gps/caltrain.log");

            return true;
        } else if (id == R.id.action_cascades) {
            ImportLogTask importer;
            importer = new ImportLogTask(MainActivity.this, 2382);
            importer.execute("Cascades Train", "http://ridealong.mybluemix.net/gps/sea-pdx-train.log");

            return true;
        } else if (id == R.id.action_record) {

            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        realm.close();
    }

}
