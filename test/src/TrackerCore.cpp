#include "TrackerCore.h"

TrackerCore::TrackerCore(double maxADC, double maxAngle)
    : potMaxADC(maxADC), potMaxAngle(maxAngle) {}

double TrackerCore::getPanelAngle(double rawPotValue) { 
    if (rawPotValue < 0) rawPotValue = 0;
    if (rawPotValue > potMaxADC) rawPotValue = potMaxADC;

    double angle = (rawPotValue / potMaxADC) * potMaxAngle;
    return angle;
}