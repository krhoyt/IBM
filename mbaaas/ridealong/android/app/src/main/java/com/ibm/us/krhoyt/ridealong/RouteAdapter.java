package com.ibm.us.krhoyt.ridealong;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ListAdapter;
import android.widget.TextView;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import io.realm.RealmBaseAdapter;
import io.realm.RealmResults;

public class RouteAdapter extends RealmBaseAdapter<Route> implements ListAdapter {

    public RouteAdapter(Context context, RealmResults<Route> results, boolean automatic) {
        super(context, results, automatic);
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        View row = convertView;
        ViewHolder holder;

        if (row == null) {
            row = inflater.inflate(R.layout.route_row, parent, false);
            holder = new ViewHolder();
            holder.routeName = (TextView) row.findViewById(R.id.text_name);
            holder.routeCreated = (TextView) row.findViewById(R.id.text_created);
            row.setTag(holder);
        } else {
            holder = (ViewHolder) row.getTag();
        }

        Route route = realmResults.get(position);

        if (route != null) {
            holder.routeName.setText(route.getName());

            SimpleDateFormat sdf = new SimpleDateFormat("M/d/yy", Locale.US);

            holder.routeCreated.setText(
                sdf.format(
                    new Date(
                        route.getCreatedAt()
                    )
                )
            );
        }

        return row;
    }

    public class ViewHolder {
        TextView    routeName;
        TextView    routeCreated;
    }

}
