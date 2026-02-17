#ifdef ARDUINO_BUILD
  #include <Arduino.h>
#endif

#include "Sensor.h"

#define OUTPUT_JSON true


#ifdef ARDUINO_BUILD

void setup() {
  Serial.begin(9600); 
}

void loop() {
  SensorReadings readings = Sensor::read();
  Serial.print("Reading East: ");
  Serial.println(readings.east);

  Serial.print("Reading West: ");
  Serial.println(readings.west);
  delay(100); 
}


#endif