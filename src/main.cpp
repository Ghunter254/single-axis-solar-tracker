
#include <Arduino.h>
#include "Sensor.h"
#include "PIDController.h"
#include "Motor.h"
#include "Telemetry.h"
#include "CommandListener.h"
#include "TrackerCore.h"

#include "HardwareDefs.h" 

  // Next we now create a PIDController object
  // with the following gains:
  double Kp = KP;
  double Ki = KI;  
  double Kd = KD;
  double maxSpeed = MAX_SPEED;
  double speedScale = 1;

  PIDController pidController(Kp, Ki, Kd, maxSpeed);
  Motor motor;
  Telemetry telemetry;
  CommandListener commandListener;
  Command cmd;

  TrackerCore trackerCore;

  static unsigned long lastTime = millis();
  bool wasDark = true;

void setup() {

  commandListener.begin(115200);
  telemetry.begin(20.0, 20.0);

  delay(1000);
  

}

void loop() {

  // Use 50ms for 20Hz sampling rate.
  // Can be adjusted to what we want
  // Recommended 20-50Hz
  commandListener.update(cmd);

  const unsigned long controlInterval = 20;
  unsigned long now = millis();

  if (now - lastTime >= controlInterval) {

    double deltaTime = (now-lastTime)/1000.0;
    lastTime = now;

    SensorReadings readings = Sensor::read();
    double potDegree = Sensor::potToDegrees(readings.pot);

    double setpoint = 0.0;
    double totalLight = readings.east + readings.west;
    double error = readings.east - readings.west;
    double normalizedError = 0.0;

    const double LIGHT_THRESHOLD = 100.0; // only track when total light is above this

    double output = 0;

    if (cmd.run) {

      if (wasDark && totalLight > LIGHT_THRESHOLD) {
            trackerCore.startScan(potDegree);
            wasDark = false;
        }

      if (trackerCore.isScanning()) {
          int scanSpeed = 0;
          
          // The scanner decides the speed.
          bool scanFinished = trackerCore.updateScan(potDegree, totalLight, scanSpeed);
          output = scanSpeed; 
          motor.drive(scanSpeed, readings.pot);

        
          if (scanFinished) {
              pidController.reset(); 
          }

      } else if (totalLight > LIGHT_THRESHOLD) {
        
          normalizedError = (error / totalLight) * 100.0;
          
          double rawOutput = pidController.compute(normalizedError, deltaTime);
          double feedforward = FF_GAIN * SUN_VELOCITY;
          output = (rawOutput * speedScale) + feedforward;

          int pwmSpeed = (int)(output);
          motor.drive(pwmSpeed, readings.pot);
          wasDark = false;

      } else {
          normalizedError = 0.0;
          motor.stop();
          pidController.reset(); 
          wasDark = true;      
        }

    } else if (cmd.stop) {
        motor.stop();
        pidController.reset(); 
    }

    telemetry.send(
      trackerCore.isScanning(),
      potDegree,
      readings.pot,
      readings.east,
      readings.west,
      normalizedError,
      output,
      setpoint,
      Kp,
      Ki,
      Kd
    );



  }
}
