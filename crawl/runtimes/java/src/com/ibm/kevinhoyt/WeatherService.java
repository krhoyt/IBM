package com.ibm.kevinhoyt;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.json.JsonReaderFactory;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.QueryParam;

@Path( "/weather" )
public class WeatherService 
{
	// Constants
	public static final String FORECAST_API = "_YOUR_FORECAST_IO_API_KEY_";	
	public static final String FORECAST_IO = "https://api.forecast.io/forecast/";
	public static final String FORECAST_KEY = "forecast";
	public static final String GOOGLE_ARGUMENT = "latlng";	
	public static final String GOOGLE_GEO = "http://maps.googleapis.com/maps/api/geocode/json";
	public static final String GOOGLE_SENSOR = "sensor=true";
	public static final String KEY_ADDRESS_COMPONENTS = "address_components";
	public static final String KEY_ADMINISTRATIVE_AREA = "administrative_area_level_1";
	public static final String KEY_CURRENTLY = "currently";
	public static final String KEY_DAILY = "daily";
	public static final String KEY_DATA = "data";
	public static final String KEY_ICON = "icon";
	public static final String KEY_LOCALITY = "locality";
	public static final String KEY_LONG_NAME = "long_name";
	public static final String KEY_MAXIMUM = "temperatureMax";
	public static final String KEY_MINIMUM = "temperatureMin";	
	public static final String KEY_RESULTS = "results";	
	public static final String KEY_SHORT_NAME = "short_name";
	public static final String KEY_SUMMARY = "summary";	
	public static final String KEY_TEMPERATURE= "temperature";
	public static final String KEY_TYPES = "types";
		
	// Get forecast data based on geolocation
	// Response from service is JSON
	// Data is decoded into object mapping
	protected Weather forecast( String latitude, String longitude )
	{
		ByteArrayInputStream	stream = null;	
		JsonArray				ranges = null;
		JsonObject				currently = null;
		JsonObject				daily = null;		
		JsonObject				data = null;
		JsonObject				today = null;
		JsonReaderFactory		factory = null;
		JsonReader				reader = null;
		StringBuffer			response = null;		
		Weather					weather = null;		

		// Make service request
		// Forecast data
		response = request(
			FORECAST_IO + FORECAST_API + "/" + latitude + "," + longitude		
		);
		
		// Map JSON to object
		if( response != null )
		{
			// Weather object
			weather = new Weather();			
			
			// Input stream needed by factory
			stream = new ByteArrayInputStream( response.toString().getBytes() );
			
			// JSON factory and reader
			factory = Json.createReaderFactory( null );
			reader = factory.createReader( stream );
			
			// Read JSON object
			data = reader.readObject();
			
			// Cleanup
			// Reader
			reader.close();
			
			// Stream
			try {
				stream.close();
			} catch( IOException ioe ) {
				ioe.printStackTrace();
			}
			
			// Get current conditions
			currently = data.getJsonObject( KEY_CURRENTLY );
			
			// Get daily range for today
			daily = data.getJsonObject( KEY_DAILY );
			ranges = daily.getJsonArray( KEY_DATA );
			today = ranges.getJsonObject( 0 );
			
			// Assign data to mapped object
			weather.temperature = currently.getJsonNumber( KEY_TEMPERATURE ).bigDecimalValue().floatValue();
			weather.icon = currently.getString( KEY_ICON );
			weather.summary = currently.getString( KEY_SUMMARY );
			weather.maximum = today.getJsonNumber( KEY_MAXIMUM ).bigDecimalValue().floatValue();
			weather.minimum = today.getJsonNumber( KEY_MINIMUM ).bigDecimalValue().floatValue();
		}
		
		// Return mapped object
		return weather;		
	}
	
	// Called to perform reverse geolocation lookup
	// Call against Google API
	// Response is JSON-encoded
	protected Weather location( String latitude, String longitude )
	{
		ByteArrayInputStream	stream = null;
		JsonArray				address = null;
		JsonArray				types = null;
		JsonObject				component = null;
		JsonObject				data = null;
		JsonObject				results = null;		
		JsonReader				reader = null;
		JsonReaderFactory		factory = null;
		StringBuffer			response = null;
		Weather					weather = null;

		// Make service request
		// Location data
		response = request(				
			GOOGLE_GEO + "?" + GOOGLE_ARGUMENT + "=" + latitude + "," + longitude + "&" + GOOGLE_SENSOR		
		);		
		
		// Map JSON to object
		if( response != null )
		{
			// Weather object
			weather = new Weather();
			
			// Input stream needed by factory
			stream = new ByteArrayInputStream( response.toString().getBytes() );
			
			// JSON factory and reader
			factory = Json.createReaderFactory( null );
			reader = factory.createReader( stream );
			
			// Read JSON object
			data = reader.readObject();
			
			// Cleanup
			// Reader
			reader.close();
			
			// Stream
			try {
				stream.close();
			} catch( IOException ioe ) {
				ioe.printStackTrace();
			}
			
			// Get root object
			// Get address component array
			results = data.getJsonArray( KEY_RESULTS ).getJsonObject( 0 );
			address = results.getJsonArray( KEY_ADDRESS_COMPONENTS );
			
			// Loop through address component options
			for( int c = 0; c < address.size(); c++ )
			{
				// Current component
				// Address type description for component
				component = address.getJsonObject( c );
				types = component.getJsonArray( KEY_TYPES );

				// Look for city component type
				if( types.getString( 0 ).equals( KEY_LOCALITY ) )
				{
					weather.city = component.getString( KEY_LONG_NAME );
				}
				
				// Look for state component type
				if( types.getString( 0 ).equals( KEY_ADMINISTRATIVE_AREA ) )
				{
					weather.state = component.getString( KEY_SHORT_NAME );
				}
			}
		}
		
		return weather;
	}
	
	// Generic HTTP request handler
	// Servlet makes two network requests
	// Both are HTTP GET and both return JSON
	protected StringBuffer request( String path )
	{
		BufferedReader		buffer = null;
		HttpURLConnection	connection = null;
		InputStreamReader	reader = null;
		String				line = null;
		StringBuffer		response = null;
		URL					url = null;
				
		// Request data
		try {						
			// Location of service
			url = new URL( path );			
			
			// Connect
			connection = ( HttpURLConnection )url.openConnection();
			connection.setRequestMethod( "GET" );
	  
			// Prepare to read response
			reader = new InputStreamReader( connection.getInputStream() );
			buffer = new BufferedReader( reader );
			
			// Response data is JSON-encoded string
			response = new StringBuffer();
	 
			// Read response data 
			while( ( line = buffer.readLine() ) != null ) 
			{
				response.append( line );
			}
			
			// Close the connection
			buffer.close();			
		} catch( MalformedURLException murle ) {
			murle.printStackTrace();
		} catch( IOException ioe ) {
			ioe.printStackTrace();
		}	
		
		return response;
	}	

	// Get request for weather data
	// Based on provided geolocation coordinates
	// Also performs reverse lookup of location name	
	@GET	
	public String doWeather( @QueryParam( "latitude" ) String latitude, @QueryParam( "longitude" ) String longitude )
	{
		Weather result = null;
		Weather	weather = null;
		
		// Get forecast data
		result = forecast( 
			latitude,
			longitude
		);		
		
		// Map to return object
		weather = new Weather();
		weather.temperature = result.temperature;
		weather.icon = result.icon;
		weather.summary = result.summary;
		weather.maximum = result.maximum;
		weather.minimum = result.minimum;
		
		// Get location data
		result = location(
			latitude,
			longitude				
		);
		
		// Map to return object
		weather.city = result.city;
		weather.state = result.state;
		
		return weather.toJson();
	}
}
