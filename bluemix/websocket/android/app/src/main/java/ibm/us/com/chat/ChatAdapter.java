package ibm.us.com.chat;

import android.content.Context;
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

        // Layout access
        inflater = (LayoutInflater)context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);

        // Get row layout
        row = inflater.inflate(R.layout.chat_row, parent, false);

        // Get label
        label = (TextView)row.findViewById(R.id.text_content);

        // Set the text
        label.setText(items.get(position).getContent());

        // Return row
        return row;
    }
}
