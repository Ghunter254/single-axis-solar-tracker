#include "Motor.h"
#include "HardwareDefs.h" 

#ifdef ARDUINO_BUILD
  #include <Arduino.h>
#endif

// CONSTRUCTOR
Motor::Motor() {
        
    pinMode(PIN_MOTOR_IN1, OUTPUT);
    pinMode(PIN_MOTOR_IN2, OUTPUT);

    windowStartTime = millis();
    
    stop();

}

// void Motor::drive(int speed, double potReadings) {


//     // Deadband
//     if (abs(speed) < 5) {
//         stop();
//         return;
//     }

//     if (potReadings > POT_READING_MAX || potReadings < POT_READING_MIN) {
//       stop();
//       return;
//     }

//     // Clamping
//     if (speed > 100) speed = 100;
//     if (speed < -100) speed = -100;

//     // Pins

//     if (speed > 5) {
//     digitalWrite(PIN_MOTOR_IN1, HIGH);
//     digitalWrite(PIN_MOTOR_IN2, LOW);
//     delay(speed);
//     digitalWrite(PIN_MOTOR_IN1, LOW);
//     digitalWrite(PIN_MOTOR_IN2, LOW);
//     delay(100 - speed);
//   } else if (speed < -5) {  // Fixed: check for negative values
//     digitalWrite(PIN_MOTOR_IN2, HIGH);
//     digitalWrite(PIN_MOTOR_IN1, LOW);
//     delay((-1) * speed);  // speed is negative, so this becomes positive
//     digitalWrite(PIN_MOTOR_IN1, LOW);
//     digitalWrite(PIN_MOTOR_IN2, LOW);
//     delay(100 + speed);  // speed is negative, so this subtracts
//   } else {
//     digitalWrite(PIN_MOTOR_IN1, LOW);
//     digitalWrite(PIN_MOTOR_IN2, LOW);
//   }


//     // unsigned long startBurst = millis();

//     // while (millis() - startBurst < 20) {
//     //     digitalWrite(groundPin, LOW);

//     //     digitalWrite(activePin, HIGH);
//     //     delayMicroseconds(10 * speed);

//     //     // For pulsing off i guess.
//     //     digitalWrite(activePin, LOW);
//     //     delayMicroseconds(1000 - (10 * speed));
//     // }
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