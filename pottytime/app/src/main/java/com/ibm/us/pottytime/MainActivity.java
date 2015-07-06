package com.ibm.us.pottytime;

import android.app.Activity;
import android.content.Intent;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.Button;
import android.widget.ListView;

import java.util.ArrayList;


public class MainActivity extends Activity {

    private Button              btnDetail = null;
    private ListView            lstHistory = null;

    private ArrayList<Potty>    history = null;
    private PottyAdapter        adapter = null;

    @Override
    protected void onCreate( Bundle savedInstanceState ) {
        super.onCreate( savedInstanceState );
        setContentView( R.layout.activity_master );

        // Data model
        history = new ArrayList<Potty>();
        adapter = new PottyAdapter( this, history );

        // Testing
        for( int p = 0; p < 100; p++ )
        {
            Potty   test = new Potty();
            history.add( test );
        }

        // List
        lstHistory = ( ListView )findViewById( R.id.list_history );
        lstHistory.setAdapter( adapter );
        lstHistory.setOnItemClickListener(new AdapterView.OnItemClickListener() {

            @Override
            public void onItemClick( AdapterView<?> parent, View view, int position, long id ) {
                Intent  detail = null;
                Potty   potty = null;

                potty = ( Potty )parent.getAdapter().getItem( position );

                detail = new Intent( MainActivity.this, DetailActivity.class );
                // detail.putExtra( EXTRA_MESSAGE, message );
                startActivity( detail );
            }

        } );
    }

}
