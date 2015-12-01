package com.ibm.us.krhoyt.ridealong;

import io.realm.RealmObject;
import io.realm.annotations.PrimaryKey;

public class Route extends RealmObject {

    @PrimaryKey
    private long    createdAt;
    private String  name;

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

}
