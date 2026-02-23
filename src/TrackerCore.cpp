#include "TrackerCore.h"

TrackerCore::TrackerCore() {
    _isScanning = false;
    _scanPhase = 0;
    _bestDirection = 0;
}

void TrackerCore::startScan(double currentAngle) {
    _isScanning = true;
    _scanPhase = 0;           
    _baseAngle = currentAngle;
    _bestDirection = 0;
}

bool TrackerCore::updateScan(double currentAngle, int totalLight, int &motorSpeedCommand) {
    
    if (!_isScanning) {
        motorSpeedCommand = 0;
        return true; 
    }

    switch (_scanPhase) {
        
        case 0: 
            _lightBase = totalLight;
            _scanPhase = 1; 

        case 1: 
            
            if (currentAngle < (_baseAngle + SCAN_OFFSET) && currentAngle < MAX_SAFE_ANGLE) {
                motorSpeedCommand = SCAN_SPEED; 
            } else {
                // We reached the right boundary. Stop, record, and switch phases.
                motorSpeedCommand = 0;
                _lightRight = totalLight;
                _scanPhase = 2;
            }
            break;

        case 2:
            
            if (currentAngle > (_baseAngle - SCAN_OFFSET) && currentAngle > MIN_SAFE_ANGLE) {
                motorSpeedCommand = -SCAN_SPEED; 
            } else {
                // We reached the left boundary. Stop, record, and switch phases.
                motorSpeedCommand = 0;
                _lightLeft = totalLight;
                _scanPhase = 3;
            }
            break;

        case 3: 
            int maxLight = _lightBase;
            _bestDirection = 0; 

            // Was the right sweep brighter?
            if (_lightRight > maxLight) {
                maxLight = _lightRight;
                _bestDirection = 1;
            }
            
            // Was the left sweep the brightest of all?
            if (_lightLeft > maxLight) {
                maxLight = _lightLeft;
                _bestDirection = -1;
            }

            _isScanning = false; 
            motorSpeedCommand = 0;
            break;
    }

    // Return true if the scan is finished
    return !_isScanning; 
}

int TrackerCore::getScanResult() {
    return _bestDirection;
}

bool TrackerCore::isScanning() {
    return _isScanning;
}