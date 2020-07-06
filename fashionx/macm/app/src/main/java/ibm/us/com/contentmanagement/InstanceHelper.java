package ibm.us.com.contentmanagement;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.DatabaseUtils;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import java.util.ArrayList;

public class InstanceHelper extends SQLiteOpenHelper {
    public InstanceHelper(Context context) {
        super(context, "macm.db" , null, 1);
    }

    public int count(){
        SQLiteDatabase db = getReadableDatabase();

        return (int)DatabaseUtils.queryNumEntries(db, "instances");
    }

    public void create(Instance data) {
        SQLiteDatabase db = getWritableDatabase();

        ContentValues content = new ContentValues();
        content.put("name", data.name);
        content.put("password", data.password);
        content.put("root", data.root);
        content.put("server", data.server);
        content.put("user", data.user);

        db.insert("instances", null, content);
    }

    public void reset() {
        SQLiteDatabase db = getWritableDatabase();
        db.execSQL("DELETE * FROM instances");
    }

    public ArrayList<Instance> list() {
        ArrayList<Instance> instances = new ArrayList<Instance>();
        Cursor cursor;
        Instance instance;
        SQLiteDatabase db = getReadableDatabase();

        cursor = db.rawQuery("select * from instances", null);
        cursor.moveToFirst();

        while(!cursor.isAfterLast()) {
            instance = new Instance();

            instance.name = cursor.getString(cursor.getColumnIndex("name"));
            instance.password = cursor.getString(cursor.getColumnIndex("password"));
            instance.root = cursor.getString(cursor.getColumnIndex("root"));
            instance.server = cursor.getString(cursor.getColumnIndex("server"));
            instance.user = cursor.getString(cursor.getColumnIndex("user"));

            instances.add(instance);

            cursor.moveToNext();
        }

        cursor.close();

        return instances;
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL(
            "create table instances ( " +
            "id integer primary key, " +
            "name text, " +
            "password text, " +
            "root text, " +
            "server text, " +
            "user text " +
            ")"
        );
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS instances");
        onCreate(db);
    }
}
