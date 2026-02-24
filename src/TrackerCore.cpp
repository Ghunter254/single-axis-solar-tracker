// #include "TrackerCore.h"
// #include <Arduino.h>

// #include <math.h>

// TrackerCore::TrackerCore() {
//     _isScanning = false;
//     _scanPhase = 0;
//     _bestDirection = 0;
// }

// void TrackerCore::startScan(double currentAngle) {
//     _isScanning = true;
//     _scanPhase = 0;           
//     _baseAngle = currentAngle;
//     _bestDirection = 0;
// }

// bool TrackerCore::updateScan(double currentAngle, int totalLight, int &motorSpeedCommand) {
    
//     if (!_isScanning) {
//         motorSpeedCommand = 0;
//         return true; 
//     }

//     switch (_scanPhase) {
        
//         case 0: 
//             _lightBase = totalLight;
//             _scanPhase = 1; 
//             break;

//         case 1: 
            
//             if (currentAngle < (_baseAngle + SCAN_OFFSET) && currentAngle < MAX_SAFE_ANGLE) {
//                 motorSpeedCommand = -SCAN_SPEED; 
//             } else {
//                 // We reached the right boundary. Stop, record, and switch phases.
//                 motorSpeedCommand = 0;
//                 _lightRight = totalLight;
//                 _scanPhase = 2;
//             }
//             break;

//         case 2:
            
//             if (currentAngle > (_baseAngle - SCAN_OFFSET) && currentAngle > MIN_SAFE_ANGLE) {
//                 motorSpeedCommand = SCAN_SPEED; 
//             } else {
//                 // We reached the left boundary. Stop, record, and switch phases.
//                 motorSpeedCommand = 0;
//                 _lightLeft = totalLight;
//                 _scanPhase = 3;
//             }
//             break;

//         case 3: 
//             int maxLight = _lightBase;
//             _bestDirection = 0; 
//             _targetAngle = _baseAngle;

//             // Was the right sweep brighter?
//             if (_lightRight > maxLight) {
//                 maxLight = _lightRight;
//                 _bestDirection = 1;
//                 _targetAngle = _baseAngle + SCAN_OFFSET;
//             }
            
//             // Was the left sweep the brightest of all?
//             if (_lightLeft > maxLight) {
//                 maxLight = _lightLeft;
//                 _bestDirection = -1;
//                 _targetAngle = _baseAngle - SCAN_OFFSET;
//             }

//             _scanPhase = 4; // Move to the homing phase
//             break;

//         case 4: {
            
            
//             if (fabs(currentAngle - _targetAngle) > 2.0) {
                    
//                     // Keep moving towards the target using your reversed motor logic
//                     if (currentAngle < _targetAngle) {
//                         motorSpeedCommand = -SCAN_SPEED; // Need to go up
//                     } else {
//                         motorSpeedCommand = SCAN_SPEED;  // Need to go down
//                     }
                    
//             } else {
//                     // We have successfully arrived at the brightest spot!
//                     _isScanning = false; 
//                     motorSpeedCommand = 0;
//                 }
//                 break;

//         }
//     }

//     // Return true if the scan is finished
//     return !_isScanning; 
// }

// int TrackerCore::getScanResult() {
//     return _bestDirection;
// }

// bool TrackerCore::isScanning() {
//     return _isScanning;
// }

#include "TrackerCore.h"
#include <Arduino.h>
#include <math.h>

TrackerCore::TrackerCore() {
    _isScanning = false;
    _scanPhase = 0;
    _bestDirection = 0;
}

void TrackerCore::startScan(double currentAngle) {
    Serial.println(">>> startScan() called");
    Serial.print("Base angle: ");
    Serial.println(currentAngle);

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

    Serial.print("[SCAN] Phase: ");
    Serial.print(_scanPhase);
    Serial.print(" | Angle: ");
    Serial.print(currentAngle);
    Serial.print(" | TotalLight: ");
    Serial.println(totalLight);

    switch (_scanPhase) {

        case 0:
            Serial.println("Phase 0: Capturing base light");
            _lightBase = totalLight;
            Serial.print("Base light: ");
            Serial.println(_lightBase);
            _scanPhase = 1;
            break;

        case 1:
            Serial.println("Phase 1: Sweeping RIGHT");

            if (currentAngle < (_baseAngle + SCAN_OFFSET) && currentAngle < MAX_SAFE_ANGLE) {
                motorSpeedCommand = -SCAN_SPEED;
            } else {
                Serial.println("Right boundary reached");
                motorSpeedCommand = 0;
                _lightRight = totalLight;
                Serial.print("Right light: ");
                Serial.println(_lightRight);
                _scanPhase = 2;
            }
            break;

        case 2:
            Serial.println("Phase 2: Sweeping LEFT");

            if (currentAngle > (_baseAngle - SCAN_OFFSET) && currentAngle > MIN_SAFE_ANGLE) {
                motorSpeedCommand = SCAN_SPEED;
            } else {
                Serial.println("Left boundary reached");
                motorSpeedCommand = 0;
                _lightLeft = totalLight;
                Serial.print("Left light: ");
                Serial.println(_lightLeft);
                _scanPhase = 3;
            }
            break;

        case 3: {
            Serial.println("Phase 3: Evaluating brightest direction");

            int maxLight = _lightBase;
            _bestDirection = 0;
            _targetAngle = _baseAngle;

            Serial.print("Base: ");
            Serial.print(_lightBase);
            Serial.print(" | Right: ");
            Serial.print(_lightRight);
            Serial.print(" | Left: ");
            Serial.println(_lightLeft);

            if (_lightRight > maxLight) {
                maxLight = _lightRight;
                _bestDirection = 1;
                _targetAngle = _baseAngle + SCAN_OFFSET;
            }

            if (_lightLeft > maxLight) {
                maxLight = _lightLeft;
                _bestDirection = -1;
                _targetAngle = _baseAngle - SCAN_OFFSET;
            }

            Serial.print("Best direction: ");
            Serial.print(_bestDirection);
            Serial.print(" | Target angle: ");
            Serial.println(_targetAngle);

            _scanPhase = 4;
            break;
        }

        case 4: {
            Serial.println("Phase 4: Homing to target");

            double error = fabs(currentAngle - _targetAngle);

            Serial.print("Angle error: ");
            Serial.println(error);

            if (error > 2.0) {

                if (currentAngle < _targetAngle) {
                    motorSpeedCommand = -SCAN_SPEED;
                } else {
                    motorSpeedCommand = SCAN_SPEED;
                }

            } else {
                Serial.println(">>> TARGET REACHED — Scan complete!");
                _isScanning = false;
                motorSpeedCommand = 0;
            }
            break;
        }
    }

    return !_isScanning;
}

int TrackerCore::getScanResult() {
    return _bestDirection;
}

bool TrackerCore::isScanning() {
    return _isScanning;
}
