package com.ibm.us;

// General processing
import java.io.StringWriter;

// Uses Glassfish JSON
// http://search.maven.org/#search%7Cga%7C1%7Ca%3A%22javax.json%22
import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonWriter;

public class Weather {

	// Constants
	public static final String KEY_CITY = "city";	
	public static final String KEY_ICON = "icon";
	public static final String KEY_MAXIMUM = "maximum";
	public static final String KEY_MINIMUM = "minimum";
	public static final String KEY_STATE = "state";
	public static final String KEY_SUMMARY = "summary";
	public static final String KEY_TEMPERATURE = "temperature";	
	
	// Public properties
	// No access methods means I am lazy
	public float	maximum = 0;
	public float	minimum = 0;
	public float	temperature = 0;
	public String	city = null;
	public String	icon = null;
	public String	state = null;
	public String	summary = null;
	
	// Encode object as JSON
	public String toJson()
	{
		JsonObject			result = null;
		JsonObjectBuilder	builder = null;
		StringWriter		stringify = null;
		
		// Populate JSON object
		builder = Json.createObjectBuilder();
		builder.add( KEY_TEMPERATURE, temperature );
		builder.add( KEY_ICON, icon );
		builder.add( KEY_SUMMARY, summary );
		builder.add( KEY_MAXIMUM, maximum );
		builder.add( KEY_MINIMUM, minimum );
		builder.add( KEY_CITY, city );
		builder.add( KEY_STATE, state );		
		
		// Build JSON object
		result = builder.build();
		
		// Write properties to string
		stringify = new StringWriter();
		
		try( JsonWriter writer = Json.createWriter( stringify ) ) {
			writer.writeObject( result );
		}
		
		// Return encoded string
		return stringify.toString();
	}
}
