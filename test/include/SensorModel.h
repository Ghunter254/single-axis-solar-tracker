// Ghost

#pragma once

class SensorModel {

    private: 
        double ldrSensitivity; // How change in L maps to degree change
        double potMaxAngle; // Maximum angle the potentiometer can read        double potMaxADC;
        double potMaxADC; // Maximum ADC value from the potentiometer
        double sensorOffset; // How offset the LDR sensors are mounted

    public:
        SensorModel (double ldrSensitivityDeg = 1.0,  double potMaxAngleDeg = 300, double potMaxADCVal = 1023.0, double sensorOffsetDeg = 30.0);

        // LDR readings
        double getLdrEast(double sunAngle, double panelAngle);
        double getLdrWest(double sunAngle, double panelAngle);

        // Potentiometer readings
        double getPot(double panelAngle);

        // Compute Delta L from LDR readings
        double getDeltaL(double SunAngle, double panelAngle);


};