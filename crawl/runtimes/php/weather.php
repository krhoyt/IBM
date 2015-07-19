<?php

// Constants
$FORECAST_IO = 'https://api.forecast.io/forecast/';
$GOOGLE_ARGUMENT = 'latlng';
$GOOGLE_CITY = 'locality';
$GOOGLE_GEO = 'http://maps.googleapis.com/maps/api/geocode/json';
$GOOGLE_SENSOR = 'sensor=true';
$GOOGLE_STATE = 'administrative_area_level_1';
$KEY_FILE = 'forecast.io';

/*
 * Configuration
 */

// Get API key
$forecast_key = trim( file_get_contents( '../' . $KEY_FILE ) );

/*
 * Weather 
 */

// URL for forecast
$url = $FORECAST_IO . $forecast_key . '/' . $_GET['latitude'] . ',' . $_GET['longitude'];
    
// Make forecast request
$request = curl_init();

curl_setopt( $request, CURLOPT_URL, $url );
curl_setopt( $request, CURLOPT_RETURNTRANSFER, true );
curl_setopt( $request, CURLOPT_SSL_VERIFYPEER, false );

$result = curl_exec( $request );

curl_close( $request );

// Decode weather data
$response = json_decode( $result );

// Extract weather data
$weather = array();
$weather['temperature'] = $response -> currently -> apparentTemperature;
$weather['icon'] = $response -> currently -> icon;
$weather['summary'] = $response -> currently -> summary;
$weather['maximum'] = $response -> daily -> data[0] -> apparentTemperatureMax;
$weather['minimum'] = $response -> daily -> data[0] -> apparentTemperatureMin;

/*
 * Geocoding 
 */

// URL for geocoding
$url = $GOOGLE_GEO . '?' . $GOOGLE_ARGUMENT . '=' . $_GET['latitude'] . ',' . $_GET['longitude'] . '&' . $GOOGLE_SENSOR;

// Make geocoding request
$request = curl_init();

curl_setopt( $request, CURLOPT_URL, $url );
curl_setopt( $request, CURLOPT_RETURNTRANSFER, true );

$result = curl_exec( $request );

curl_close( $request );

// Decode geolocation data
$response = json_decode( $result );

// Address components
$components = $response -> results[0] -> address_components;

// Find specific components
for( $c = 0; $c < count( $components ); $c++ )
{
    // City
    if( $components[$c] -> types[0] == $GOOGLE_CITY )
    {
        $weather['city'] = $components[$c] -> long_name;    
    }
    
    // State
    if( $components[$c] -> types[0] == $GOOGLE_STATE )
    {
        $weather['state'] = $components[$c] -> short_name;    
    }    
}

/*
 * Response
 */

// Send response to client
echo json_encode( $weather );

?>
