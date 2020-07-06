package ibm.us.com.contentmanagement;

import android.os.Parcel;
import android.os.Parcelable;

public class Instance implements Parcelable {
    public String name;
    public String password;
    public String root;
    public String server;
    public String user;

    public Instance() {;}

    private Instance(Parcel in) {
        name = in.readString();
        password = in.readString();
        root = in.readString();
        server = in.readString();
        user = in.readString();
    }

    public static final Parcelable.Creator<Instance> CREATOR = new Parcelable.Creator<Instance>() {
        public Instance createFromParcel(Parcel in) {
            return new Instance(in);
        }

        public Instance[] newArray(int size) {
            return new Instance[size];
        }
    };

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(name);
        dest.writeString(password);
        dest.writeString(root);
        dest.writeString(server);
        dest.writeString(user);
    }
}
