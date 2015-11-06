package ibm.us.com.toycar;

import io.realm.RealmObject;
import io.realm.annotations.PrimaryKey;

public class EngineData extends RealmObject {

    @PrimaryKey
    private long createdAt;

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }

    /*
    private int barometric;
    private int load;
    private int coolant;
    private int coolantTemperature;
    private int fuelLevel;
    private int fuelPressure;
    private int fuelRate;
    private int intakePressure;
    private int intakeTemperature;
    private int rpm;
    private int speed;
    private int throttle;
    private int runtime;
    private int oilTemperature;
    private String vin;
    */
}

