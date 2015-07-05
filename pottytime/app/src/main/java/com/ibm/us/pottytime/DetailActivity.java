package com.ibm.us.pottytime;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;


public class DetailActivity extends Activity {

    private TextView    txtCancel = null;
    private TextView    txtDone = null;

    @Override
    protected void onCreate( Bundle savedInstanceState ) {
        super.onCreate( savedInstanceState );
        setContentView( R.layout.activity_detail );

        txtCancel = ( TextView )findViewById( R.id.text_cancel );
        txtCancel.setOnClickListener(new View.OnClickListener() {
            public void onClick(View view) {
                Log.i("DETAIL", "Transition back to main.");
                DetailActivity.this.onBackPressed();
            }
        });

        txtDone = ( TextView )findViewById( R.id.text_done );
        txtDone.setOnClickListener( new View.OnClickListener() {
            public void onClick( View view ) {
                Log.i( "DETAIL", "Save record." );
            }
        } );
    }

    /*
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
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
