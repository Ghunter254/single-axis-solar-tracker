#ifndef TRACKERCORE_H
#define TRACKERCORE_H

class TrackerCore {
private:
    double potMaxADC;    // 1023.0 for Arduino
    double potMaxAngle;  // 300.0 degrees physical range

public:
    // Constructor: Sets up the hardware calibration
    TrackerCore(double maxADC = 1023.0, double maxAngle = 300.0);

    // Converts raw Potentiometer reading to Degrees
    double getPanelAngle(double rawPotValue);
};

#endif