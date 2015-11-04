package ibm.us.com.fashionx;

import android.os.Parcel;
import android.os.Parcelable;

public class MobileContentItem implements Parcelable {

    public String image;

    public MobileContentItem() {;}

    private MobileContentItem(Parcel in) {
        image = in.readString();
    }

    public static final Parcelable.Creator<MobileContentItem> CREATOR = new Parcelable.Creator<MobileContentItem>() {
        public MobileContentItem createFromParcel(Parcel in) {
            return new MobileContentItem(in);
        }

        public MobileContentItem[] newArray(int size) {
            return new MobileContentItem[size];
        }
    };

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(image);
    }

}
