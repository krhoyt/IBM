package com.ibm.us.pottytime;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import java.util.ArrayList;

public class PottyAdapter extends ArrayAdapter<Potty> {

    private final ArrayList<Potty>  items;
    private final Context           context;

    public PottyAdapter( Context context, ArrayList<Potty> list ) {
        super( context, R.layout.item_row, list );

        this.context = context;
        this.items = list;
    }

    @Override
    public View getView( int position, View convert, ViewGroup parent ) {
        LayoutInflater  inflater = null;
        TextView        label = null;
        View            row = null;

        // Row re-use
        row = convert;

        // Build only if necessary
        if( row == null ) {
            // Layout access
            inflater = ( LayoutInflater )context.getSystemService( Context.LAYOUT_INFLATER_SERVICE );

            // Get row layout
            row = inflater.inflate( R.layout.item_row, parent, false );
        }

        // Get label
        // label = ( TextView )row.findViewById( R.id.text_label );

        // Set the text
        // label.setText( items.get( position ).title );
        // label.setText( "Hello" );

        return row;
    }

}
