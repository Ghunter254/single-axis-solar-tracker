#ifndef SENSOR_H
#define SENSOR_H

// Struct to hold a snapshot of sorts.
struct SensorReadings {
    int east;   // 0-1023
    int west;   // 0-1023
    int pot;    // 0-1023
};

class Sensor {
public:
    // Reads all sensors from the pins defined in HardwareDefs
    // Thats potentiometer and ldr
    static SensorReadings read();

    
    // Helper to convert raw ADC (0-1023) to Angle (0-300)
    // I am assuming max of 300 in pot angle.
    static double potToDegrees(int adcValue);
};

#endif