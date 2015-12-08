package com.ibm.us.krhoyt.ridealong;

import android.graphics.Color;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;

import com.esri.android.map.GraphicsLayer;
import com.esri.android.map.MapView;
import com.esri.android.map.event.OnStatusChangedListener;
import com.esri.core.geometry.CoordinateConversion;
import com.esri.core.geometry.Polyline;
import com.esri.core.geometry.SpatialReference;
import com.esri.core.map.Graphic;
import com.esri.core.symbol.SimpleLineSymbol;

import io.realm.Realm;
import io.realm.RealmResults;

public class RouteActivity extends AppCompatActivity {

    private long  routeId;
    private MapView map;
    private Realm realm;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_route);

        Bundle extras = getIntent().getExtras();
        routeId = extras.getLong("routeId");

        map = (MapView) findViewById(R.id.map);
        map.setOnStatusChangedListener(new OnStatusChangedListener() {
            @Override
            public void onStatusChanged(Object source, STATUS status) {
                if (OnStatusChangedListener.STATUS.INITIALIZED == status && source == map) {
                    Log.d("ROUTE", "Map initialized.");
                    draw();
                }
            }
        });
    }

    private void draw() {
        realm = Realm.getInstance(getApplicationContext());
        RealmResults<Location> locations = realm.where(Location.class).equalTo("routeId", routeId).findAll();

        Log.d("ROUTE", locations.size() + " data points.");

        SpatialReference mercator = SpatialReference.create(102100);

        GraphicsLayer layer = new GraphicsLayer();
        map.addLayer(layer);

        SimpleLineSymbol symbol = new SimpleLineSymbol(Color.GREEN, 3, SimpleLineSymbol.STYLE.SOLID);

        Polyline track = new Polyline();

        track.startPath(
            CoordinateConversion.decimalDegreesToPoint(
                degreesToMercator(
                    locations.get(0).getLatitude(),
                    locations.get(0).getLongitude()
                ),
                mercator
            )
        );

        for (int p = 1; p < locations.size(); p++) {
            track.lineTo(
                CoordinateConversion.decimalDegreesToPoint(
                    degreesToMercator(
                        locations.get(p).getLatitude(),
                        locations.get(p).getLongitude()
                    ),
                    mercator
                )
            );
        }

        Graphic graphic = new Graphic(track, symbol);
        layer.addGraphic(graphic);

        map.setExtent(track);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        realm.close();
    }

    private String degreesToMercator(double latitude, double longitude) {
        String coordinate = String.valueOf(Math.abs(latitude));

        if (latitude > 0) {
            coordinate = coordinate + "N ";
        } else {
            coordinate = coordinate + "S ";
        }

        coordinate = coordinate + String.valueOf(Math.abs(longitude));

        if (longitude > 0) {
            coordinate = coordinate + "E";
        } else {
            coordinate = coordinate + "W";
        }

        return coordinate;
    }

}
