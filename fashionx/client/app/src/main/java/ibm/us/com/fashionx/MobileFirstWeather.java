package ibm.us.com.fashionx;

import android.os.Parcel;
import android.os.Parcelable;

public class MobileFirstWeather implements Parcelable {

    public int      temperature;
    public int      maximum;
    public int      minimum;
    public int      icon;
    public String   path;
    public String   phrase;

    public MobileFirstWeather() {;}

    private MobileFirstWeather(Parcel in) {
        temperature = in.readInt();
        maximum = in.readInt();
        minimum = in.readInt();
        icon = in.readInt();
        path = in.readString();
        phrase = in.readString();
    }

    public static final Parcelable.Creator<MobileFirstWeather> CREATOR = new Parcelable.Creator<MobileFirstWeather>() {
        public MobileFirstWeather createFromParcel(Parcel in) {
            return new MobileFirstWeather(in);
        }

        public MobileFirstWeather[] newArray(int size) {
            return new MobileFirstWeather[size];
        }
    };

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeInt(temperature);
        dest.writeInt(maximum);
        dest.writeInt(minimum);
        dest.writeInt(icon);
        dest.writeString(path);
        dest.writeString(phrase);
    }

}
