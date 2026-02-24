#include "Motor.h"
#include "HardwareDefs.h" 

#include <Arduino.h>


// CONSTRUCTOR
Motor::Motor() {
        
    pinMode(PIN_MOTOR_IN1, OUTPUT);
    pinMode(PIN_MOTOR_IN2, OUTPUT);

    windowStartTime = millis();
    
    stop();

}

// void Motor::drive(int speed, double potReadings) {

//     if (speed > 0) {
//         digitalWrite(PIN_MOTOR_IN1, HIGH);
//         digitalWrite(PIN_MOTOR_IN2, LOW);
//     } else {
//         digitalWrite(PIN_MOTOR_IN1, LOW);
//         digitalWrite(PIN_MOTOR_IN2, HIGH);
//     }
// }


void Motor::drive(int speed, double potReadings) {

    // Deadband
    if (abs(speed) < 5) {
        stop();
        return;
    }

    // Mechanical limits
    if (potReadings > POT_READING_MAX || potReadings < POT_READING_MIN) {
        stop();
        return;
    }

    // Clamp speed
    if (speed > 100) speed = 100;
    if (speed < -100) speed = -100;

    unsigned long now = millis();

    if (now - windowStartTime > windowSize) {
        windowStartTime += windowSize;
    }

    int onTime = abs(speed);  // 0–100 ms within 100ms window

    bool motorShouldBeOn = (now - windowStartTime) < onTime;

    if (!motorShouldBeOn) {
        stop();
        return;
    }

    // Direction control
    if (speed > 0) {
        //Serial.write("Motor");
        digitalWrite(PIN_MOTOR_IN1, HIGH);
        digitalWrite(PIN_MOTOR_IN2, LOW);
    } else {
        digitalWrite(PIN_MOTOR_IN1, LOW);
        digitalWrite(PIN_MOTOR_IN2, HIGH);
    }
}



void Motor::stop() {
    digitalWrite(PIN_MOTOR_IN1, LOW);
    digitalWrite(PIN_MOTOR_IN2, LOW);
    
}