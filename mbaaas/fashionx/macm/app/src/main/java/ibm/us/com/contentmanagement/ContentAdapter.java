package ibm.us.com.contentmanagement;

import android.content.Context;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import com.ibm.caas.CAASContentItem;

import java.util.ArrayList;

public class ContentAdapter extends ArrayAdapter<CAASContentItem> {
    private final ArrayList<CAASContentItem>    list;
    private final Context                       context;

    public ContentAdapter(Context context, ArrayList<CAASContentItem> list) {
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
            row = inflater.inflate(R.layout.content_row, parent, false);
        } else {
            // Use existing
            row = convert;
        }

        label = (TextView)row.findViewById(R.id.text_title);
        label.setText(list.get(position).getTitle());

        label = (TextView)row.findViewById(R.id.text_type);
        label.setText(list.get(position).getContentType());

        label = (TextView)row.findViewById(R.id.text_oid);
        label.setText(list.get(position).getOid());

        return row;
    }
}
