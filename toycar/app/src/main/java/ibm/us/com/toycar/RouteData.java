package ibm.us.com.toycar;

import io.realm.RealmList;
import io.realm.RealmObject;
import io.realm.annotations.PrimaryKey;

public class RouteData extends RealmObject {

    @PrimaryKey
    private long                    createdAt;
    private String                  name;
    private RealmList<LocationData> track;

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public RealmList<LocationData> getTrack() {
        return track;
    }

    public void setTrack(RealmList<LocationData> track) {
        this.track = track;
    }

}
