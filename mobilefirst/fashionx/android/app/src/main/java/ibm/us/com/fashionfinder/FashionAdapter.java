package ibm.us.com.fashionfinder;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;

import java.util.ArrayList;

public class FashionAdapter extends ArrayAdapter<Fashion> {

    private ArrayList<Fashion>  content = null;
    private Context             context = null;

    public FashionAdapter(Context context, ArrayList<Fashion> content) {
        super(context, R.layout.fashion_row, content);

        this.context = context;
        this.content = content;
    }

    @Override
    public View getView(int position, View convert, ViewGroup parent) {
        LayoutInflater  inflater;
        View            row;

        // Reuse view if possible
        if(convert == null) {
            inflater = (LayoutInflater)context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            row = inflater.inflate(R.layout.fashion_row, parent, false);
        } else {
            row = convert;
        }

        return row;
    }

}