#include <Wire.h>              // I2C needed for sensors
#include "SparkFunMPL3115A2.h" // Pressure sensor
#include "SparkFunHTU21D.h"    // Humidity sensor
#include <SoftwareSerial.h>    // Needed for GPS
#include <TinyGPS++.h>         // GPS parsing

// Digital
const byte WIND_SPEED = 3;
const byte RAIN = 2;
const byte STATUS_BLUE = 7;
const byte STATUS_GREEN = 8;
const byte GPS_POWER = 6;

// Analog
const byte REFERENCE_VOLTAGE = A3;
const byte LIGHT = A1;
const byte BATTERY = A2;
const byte WIND_DIRECTION = A0;

// Other
const int SAMPLE_RATE = 5000;

// Imp
const int IMP_RX = 8;
const int IMP_TX = 9;

SoftwareSerial imp( IMP_RX, IMP_TX );

// GPS
const int GPS_RX = 5;
const int GPS_TX = 4;

TinyGPSPlus gps;
SoftwareSerial soft( GPS_RX, GPS_TX );

// Pressure
MPL3115A2 pressure;

// Humidity
HTU21D humidity;

// Global
byte minutes;
long last_update;
long last_wind;

volatile byte wind_clicks = 0;
volatile float daily_rain_in = 0;
volatile float rain_hour[60];
volatile long last_wind_irq = 0;
volatile unsigned long rain;
volatile unsigned long rain_interval;
volatile unsigned long rain_last;
volatile unsigned long rain_time;

void setup() {
  // Seed variables
  last_update = 0;
  last_wind = 0;
  
  // Imp
  imp.begin( 19200 );
  
  // GPS
  soft.begin( 9600 );

  pinMode( STATUS_BLUE, OUTPUT );
  pinMode( STATUS_GREEN, OUTPUT );

  pinMode( GPS_POWER, OUTPUT );
  digitalWrite( GPS_POWER, HIGH );

  // Wind
  pinMode( WIND_SPEED, INPUT_PULLUP );

  // Rain
  pinMode( RAIN, INPUT_PULLUP );

  // Light
  pinMode( REFERENCE_VOLTAGE, INPUT );
  pinMode( LIGHT, INPUT );

  // Pressure
  pressure.begin();
  pressure.setModeBarometer();
  pressure.setOversampleRate( 7 );
  pressure.enableEventFlags();

  // Humidity
  humidity.begin();

  // Interrupts
  attachInterrupt( 0, rainIRQ, FALLING );
  attachInterrupt( 1, windIRQ, FALLING );
  interrupts();
}

void loop() {
  while( soft.available() ) {
      gps.encode( soft.read() );
  }
  
  if( ( millis() - last_update ) >= SAMPLE_RATE ) {
    imp.print( "$,speed=" );
    imp.print( get_wind_speed() );    
    imp.print( ",direction=" );
    imp.print( get_wind_direction() );
    imp.print( ",light=" );
    imp.print( get_light_level() );
    imp.print( ",battery=" );
    imp.print( get_battery_level() );
    imp.print( ",humidity=" );
    imp.print( humidity.readHumidity() );
    imp.print( ",celcius=" );
    imp.print( pressure.readTemp() );    
    imp.print( ",pressure=" );
    imp.print( pressure.readPressure() );    
    imp.print( ",latitude=" );
    imp.print( gps.location.lat() );    
    imp.print( ",longitude=" );
    imp.print( gps.location.lng() );    
    imp.print( ",altitude=" );
    imp.print( gps.altitude.meters() );    
    imp.print( ",#" );

    last_update = millis();
  }
}

/*
 * Weather
 */

float get_battery_level()
{
  float operating;
  float raw;

  operating = analogRead( REFERENCE_VOLTAGE );
  operating = 3.30 / operating;
    
  raw = analogRead( BATTERY );
  raw = operating * raw;
  raw = raw * 4.90;
  
  return raw;
}

float get_light_level() {
  float voltage;
  float light;

  voltage = analogRead( REFERENCE_VOLTAGE );
  voltage = 3.3 / voltage;
  
  light = analogRead( LIGHT );
  light = voltage * light;
  
  return light;
}

int get_wind_direction() {
  unsigned int analog;

  analog = analogRead( WIND_DIRECTION );

  if( analog < 380 ) return 113;
  if( analog < 393 ) return 68;
  if( analog < 414 ) return 90;
  if( analog < 456 ) return 158;
  if( analog < 508 ) return 135;
  if( analog < 551 ) return 203;
  if( analog < 615 ) return 180;
  if( analog < 680 ) return 23;
  if( analog < 746 ) return 45;
  if( analog < 801 ) return 248;
  if( analog < 833 ) return 225;
  if( analog < 878 ) return 338;
  if( analog < 913 ) return 0;
  if( analog < 940 ) return 293;
  if( analog < 967 ) return 315;
  if( analog < 990 ) return 270;
  
  return -1;
}

float get_wind_speed() {
  float delta;
  float wind_speed;

  delta = millis() - last_wind;
  delta =  delta / 1000.0;

  wind_speed = ( float )wind_clicks / delta;

  wind_clicks = 0;
  last_wind = millis();

  wind_speed = wind_speed * 1.492;

  return wind_speed;
}

/*
 * Interrupts
 */
 
void rainIRQ() {
  rain_time = millis();
  rain_interval = rain_time - rain_last;

  if( rain_interval > 10 ) {
    daily_rain_in = daily_rain_in + 0.011;
    rain_hour[minutes] = rain_hour[minutes] + 0.011;

    rain_last = rain_time;
  }
}

void windIRQ() {
  if( millis() - last_wind_irq > 10 ) {
    last_wind_irq = millis();
    wind_clicks = wind_clicks + 1;
  }
}

