package com.ibm.us;

// Uses Glassfish JSON
// http://search.maven.org/#search%7Cga%7C1%7Ca%3A%22javax.json%22

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonWriter;
import javax.json.stream.JsonParser;
import javax.json.stream.JsonParser.Event;

public class WeatherServlet extends HttpServlet {

	public static final String FORECAST_IO = "https://api.forecast.io/forecast/";
	public static final String FORECAST_KEY = "forecast";
	public static final String KEY_APPARENT_MAXIMUM = "apparentTemperatureMax";
	public static final String KEY_APPARENT_MINIMUM = "apparentTemperatureMin";
	public static final String KEY_APPARENT_TEMPERATURE= "apparentTemperature";	
	public static final String KEY_ICON = "icon";
	public static final String KEY_MAXIMUM = "maximum";
	public static final String KEY_MINIMUM = "minimum";
	public static final String KEY_SUMMARY = "summary";
	public static final String KEY_TEMPERATURE = "temperature";
	public static final String QUERY_LATITUDE = "latitude";
	public static final String QUERY_LONGITUDE = "longitude";
	
	private static final long serialVersionUID = 1L;	
	
	protected String	forecastKey = null;
	
	protected String encode( Weather weather )
	{
		JsonObject			result = null;
		JsonObjectBuilder	builder = null;
		StringWriter		stringify = null;
		
		builder = Json.createObjectBuilder();
		builder.add( KEY_TEMPERATURE, weather.temperature );
		builder.add( KEY_ICON, weather.icon );
		builder.add( KEY_SUMMARY, weather.summary );
		builder.add( KEY_MAXIMUM, weather.maximum );
		builder.add( KEY_MINIMUM, weather.minimum );
		
		result = builder.build();
		
		stringify = new StringWriter();
		
		try( JsonWriter writer = Json.createWriter( stringify ) ) {
			writer.writeObject( result );
		}
		
		return stringify.toString();
	}
	
	protected Weather forecast( String latitude, String longitude )
	{
		BufferedReader			buffer = null;
		ByteArrayInputStream	stream = null;
		Event					event = null;
		HttpURLConnection		connection = null;
		InputStreamReader		reader = null;
		JsonParser				parser = null;
		String					line = null;
		StringBuffer			response = null;
		URL						url = null;
		Weather					weather = null;
		
		try {			
			url = new URL( FORECAST_IO + forecastKey + "/" + latitude + "," + longitude );
			
			connection = ( HttpURLConnection )url.openConnection();
			connection.setRequestMethod( "GET" );
	  
			reader = new InputStreamReader( connection.getInputStream() );
			buffer = new BufferedReader( reader );
			
			response = new StringBuffer();
	 
			while( ( line = buffer.readLine() ) != null ) 
			{
				response.append( line );
			}
			
			buffer.close();			
		} catch( MalformedURLException murle ) {
			murle.printStackTrace();
		} catch( IOException ioe ) {
			ioe.printStackTrace();
		}

		if( response != null )
		{
			weather = new Weather();
			
			stream = new ByteArrayInputStream( response.toString().getBytes() );
			parser = Json.createParser( stream );
			
			while( parser.hasNext() )
			{
				event = parser.next();
				
				if( event == Event.KEY_NAME )
				{
					switch( parser.getString() ) 
					{
						case KEY_APPARENT_TEMPERATURE:
							parser.next();
							weather.temperature = parser.getBigDecimal().floatValue();
							break;
							
						case KEY_ICON:
							parser.next();
							weather.icon = parser.getString();
							break;							
							
						case KEY_SUMMARY:
							parser.next();
							weather.summary = parser.getString();
							break;							
							
						case KEY_APPARENT_MAXIMUM:
							parser.next();
							weather.maximum = parser.getBigDecimal().floatValue();
							break;
							
						case KEY_APPARENT_MINIMUM:
							parser.next();
							weather.minimum = parser.getBigDecimal().floatValue();
							break;							
					}
				}
			}
		}
		
		return weather;		
	}
	
	public void init( ServletConfig config ) throws ServletException
	{
	    forecastKey = config.getInitParameter( FORECAST_KEY );
	}	
	
	protected void doGet( HttpServletRequest request, HttpServletResponse response ) throws ServletException, IOException
	{
		PrintWriter	out = null;
		String		latitude = null;
		String		longitude = null;
		Weather		result = null;
		Weather		weather = null;
		
		latitude = request.getParameter( QUERY_LATITUDE );
		longitude = request.getParameter( QUERY_LONGITUDE );
					
		result = forecast( latitude, longitude );		
		
		weather = new Weather();
		weather.temperature = result.temperature;
		weather.icon = result.icon;
		weather.summary = result.summary;
		weather.maximum = result.maximum;
		weather.minimum = result.minimum;
		
		out = response.getWriter();
		out.print( encode( weather ) );
	}	
	
}
