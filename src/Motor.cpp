#include "Motor.h"
#include "HardwareDefs.h" 

#ifdef ARDUINO_BUILD
  #include <Arduino.h>
#endif

// CONSTRUCTOR
Motor::Motor() {
        
    pinMode(PIN_MOTOR_IN1, OUTPUT);
    pinMode(PIN_MOTOR_IN2, OUTPUT);
    
    stop();

}

void Motor::drive(int speed) {


    // Deadband
    if (abs(speed) < 20) {
        stop();
        return;
    }

    // Clamping
    if (speed > 100) speed = 100;
    if (speed < -100) speed = -100;

    // Pins
    int activePin, groundPin;
    if (speed > 0) {
        activePin = PIN_MOTOR_IN1; // Right
        groundPin = PIN_MOTOR_IN2;
    } else {
        activePin = PIN_MOTOR_IN2; // Left
        groundPin = PIN_MOTOR_IN1;
    }


    unsigned long startBurst = millis();

    while (millis() - startBurst < 20) {
        digitalWrite(groundPin, LOW);

        digitalWrite(activePin, HIGH);
        delayMicroseconds(10 * speed);

        // For pulsing off i guess.
        digitalWrite(activePin, LOW);
        delayMicroseconds(1000 - (10 * speed));
    }
}


void Motor::stop() {
    digitalWrite(PIN_MOTOR_IN1, LOW);
    digitalWrite(PIN_MOTOR_IN2, LOW);
    
}