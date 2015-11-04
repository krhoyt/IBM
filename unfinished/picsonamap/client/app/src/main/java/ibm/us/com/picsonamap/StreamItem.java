package ibm.us.com.picsonamap;

public class StreamItem
{
    private static final String LATITUDE = "latitude";
    private static final String LONGITUDE = "longitude";
    private static final String SOURCE = "source";

    private Double  latitude = null;
    private Double  longitude = null;
    private String  id = null;
    private String  source = null;

    public String getId()
    {
        return id;
    }

    public void setId( String id )
    {
        this.id = id;
    }

    public String getSource()
    {
        return source;
    }

    public void setSource( String source )
    {
        this.source = source;
    }

    public Double getLatitude()
    {
        return latitude;
    }

    public void setLatitude( Double latitude )
    {
        this.latitude = latitude;
    }

    public Double getLongitude()
    {
        return latitude;
    }

    public void setLongitude( Double longitude )
    {
        this.longitude = longitude;
    }
}