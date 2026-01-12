#include "SensorModel.h"
#include <cmath>


// Constructor for SensorModel
SensorModel::SensorModel(double ldrSensitivityDeg, double potMaxAngleDeg, double potMaxADCVal, double sensorOffsetDeg)
    : ldrSensitivity(ldrSensitivityDeg),
      potMaxAngle(potMaxAngleDeg),
      potMaxADC(potMaxADCVal),
      sensorOffset(sensorOffsetDeg) {}

// LDR simulation.

double SensorModel::getLdrEast(double sunAngle, double panelAngle) {
    double sensorPointingAngle = panelAngle - sensorOffset;
    double relativeAngle = sunAngle - sensorPointingAngle;
    double L = std::exp(-std::pow(relativeAngle / ldrSensitivity, 2));
    double L_adc = 1023.0 * L; // Scale to ADC range
    return L_adc;
}

double SensorModel::getLdrWest(double sunAngle, double panelAngle) {
    double sensorPointingAngle = panelAngle + sensorOffset;
    double relativeAngle = sunAngle - sensorPointingAngle;
    double L = std::exp(-std::pow(relativeAngle / ldrSensitivity, 2));
    double L_adc = 1023.0 * L; // Scale to ADC range
    return L_adc;
}

double SensorModel::getPot(double panelAngle) {
    double potValue = (panelAngle / potMaxAngle) * potMaxADC;

    if (potValue < 0) potValue = 0;
    if (potValue > potMaxADC) potValue = potMaxADC;
    return potValue;
}

double SensorModel::getDeltaL(double sunAngle, double panelAngle) {
    double L_east = getLdrEast(sunAngle, panelAngle);
    double L_west = getLdrWest(sunAngle, panelAngle);
    return L_east - L_west;
}