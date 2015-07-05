package com.ibm.us.pottytime;

import android.app.Activity;
import android.content.Intent;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;


public class MainActivity extends Activity {

    private Button  btnDetail = null;

    @Override
    protected void onCreate( Bundle savedInstanceState ) {
        super.onCreate( savedInstanceState );
        setContentView( R.layout.activity_master );

        btnDetail = ( Button )findViewById( R.id.button_detail );
        btnDetail.setOnClickListener( new View.OnClickListener() {
            public void onClick( View view ) {
                Log.i( "DETAIL", "Transition to detail." );

                Intent detail = null;

                detail = new Intent( MainActivity.this, DetailActivity.class );
                // detail.putExtra( PottyDetailFragment.ARG_ITEM_ID, id );
                startActivity( detail );
            }
        } );
    }
/*
    @Override
    public boolean onCreateOptionsMenu( Menu menu ) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate( R.menu.menu_main, menu );
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }
*/

}
