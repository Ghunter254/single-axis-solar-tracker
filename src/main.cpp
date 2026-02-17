
#include <Arduino.h>
#include "Sensor.h"
#include "PIDController.h"
#include "Motor.h"

  // Next we now create a PIDController object
  // with the following gains:
  double Kp = 0.1;
  double Ki = 0.01;  
  double Kd = 0.05;
  double maxSpeed = 100;

  PIDController pidController(Kp, Ki, Kd, maxSpeed);
  Motor motor;


void setup() {
}

void loop() {

  SensorReadings readings = Sensor::read();
  double output = pidController.compute((readings.west-readings.east), 0.1);
  int pwmSpeed = (int)(output);
  motor.drive(pwmSpeed);

  delay(100); 
}
