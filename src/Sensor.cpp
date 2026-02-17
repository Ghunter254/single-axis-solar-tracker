#include "Sensor.h"
#include "HardwareDefs.h" 

#ifdef ARDUINO_BUILD
  #include <Arduino.h>    
#endif

SensorReadings Sensor::read() {
    SensorReadings data;

    #ifdef ARDUINO_BUILD
        data.east = analogRead(PIN_LDR_EAST);
        data.west = analogRead(PIN_LDR_WEST);
        data.pot  = analogRead(PIN_POT);
    #else

        data.east = 0;
        data.west = 0;
        data.pot  = 0;

    #endif

    return data;
}

double Sensor::potToDegrees(int adcValue) {
    // Formula: (ADC Value / MaxADC) * MaxAngle ... Recall this...

    return (static_cast<double>(adcValue) / 1023.0) * 300.0;
}