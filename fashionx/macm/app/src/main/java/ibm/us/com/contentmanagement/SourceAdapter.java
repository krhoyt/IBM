package ibm.us.com.contentmanagement;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import java.util.ArrayList;

public class SourceAdapter extends ArrayAdapter<Instance> {
    private final ArrayList<Instance>   list;
    private final Context               context;

    public SourceAdapter(Context context, ArrayList<Instance> list) {
        super(context, R.layout.source_row, list);

        this.context = context;
        this.list = list;
    }

    @Override
    public View getView(int position, View convert, ViewGroup parent) {
        LayoutInflater  inflater;
        TextView        label;
        View            row;

        // Reuse rows if possible
        if(convert == null) {
            // Layout access
            inflater = (LayoutInflater)context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);

            // Get row layout
            row = inflater.inflate(R.layout.source_row, parent, false);
        } else {
            // Use existing
            row = convert;
        }

        label = (TextView)row.findViewById(R.id.text_name);
        label.setText(list.get(position).name);

        label = (TextView)row.findViewById(R.id.text_server);
        label.setText(list.get(position).server);

        return row;
    }
}
