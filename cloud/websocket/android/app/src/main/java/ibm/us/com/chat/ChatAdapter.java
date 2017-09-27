package ibm.us.com.chat;

import android.content.Context;
import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import java.util.ArrayList;

public class ChatAdapter extends ArrayAdapter<ChatMessage> {
    private final ArrayList<ChatMessage>    items;
    private final Context                   context;

    public ChatAdapter(Context context, ArrayList<ChatMessage> list) {
        super(context, R.layout.chat_row, list);

        this.context = context;
        this.items = list;
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
            row = inflater.inflate(R.layout.chat_row, parent, false);
        } else {
            // Use existing
            row = convert;
        }

        // Get label
        label = (TextView)row.findViewById(R.id.text_content);

        // Set the text
        label.setText(items.get(position).message);

        // Set the color
        label.setTextColor(
            Color.rgb(
                items.get(position).red,
                items.get(position).green,
                items.get(position).blue
            )
        );

        // Return row
        return row;
    }
}
