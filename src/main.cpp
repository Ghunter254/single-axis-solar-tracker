#include <iostream>
#include <cmath>
#include <iomanip>
#include <thread>
#include <chrono>

#include "SensorModel.h"
#include "PIDController.h"
#include "TrackerCore.h"

#define OUTPUT_JSON true


int main () {

  // Creating a SensorModel  object with the following parameters:
  // Ldr sensitivity: 90 degrees
  // Potentiometer max angle: 300 degrees
  // Potentiometer max ADC value: 1023
  // Sensor offset: 30 degrees

  SensorModel sensorModel(40.0, 300.0, 1023.0, 30.0);

  // Next we now create a PIDController object
  // with the following gains:
  double Kp = 0.1;
  double Ki = 0.01;  
  double Kd = 0.05;
  double maxSpeed = 10; // Hiki ni degrees per second

  PIDController pidController(Kp, Ki, Kd, maxSpeed);
  TrackerCore trackerCore;

  // Now initial conditions
  double sunAngle = 150.0; // degrees
  double panelAngle = 100.0; // degrees
  double deltaTime = 0.1; // seconds ---> time step for simulation

  if (!OUTPUT_JSON) {
  std::cout << "Starting Simulation...\n";
    std::cout << "Target Sun Angle: " << sunAngle << "\n";
    std::cout << "Initial Panel Angle: " << panelAngle << "\n\n";
    std::cout << "Time(s) | Panel Angle | Error (DeltaL) | Motor Speed | P-Action\n";
    std::cout << "-------------------------------------------------------------\n";
  }

// LOOP FOR SIMULATION
    while (true) {
        static double time = 0.0;
        
        
        // Measure Error (The Sensors)
        // Note: We swap East-West to get the correct sign direction
        // If DeltaL is positive, we want to move +Positive direction.
        double deltaL = sensorModel.getDeltaL(sunAngle, panelAngle);

        // // Now we get the raw POT value
        // double potValue = sensorModel.getPot(panelAngle);
        // double measuredAngle = trackerCore.getPanelAngle(potValue);
        
        // Calculate Control Signal (The PID)
        double motorSpeed = pidController.compute(0.0, deltaL, deltaTime);

        // Apply Physics (The Motor)
        // New Position = Old Position + (Velocity * Time)
        panelAngle += motorSpeed * deltaTime;
        // Output Status
        if (OUTPUT_JSON) {
        // Machine-readable format for the Dashboard
        std::cout << "{"
              << "\"time\":" << time << ","
              << "\"angle\":" << panelAngle << ","
              << "\"sunAngle\":" << sunAngle << ","
              << "\"deltaL\":" << deltaL << ","
              << "\"motorSpeed\":" << motorSpeed
              << "}" << std::endl; 
        }
        else {
        std::cout << std::fixed << std::setprecision(2)
                  << std::setw(6) << time << "s | "
                  << std::setw(10) << panelAngle << "° | "
                  << std::setw(13) << deltaL << " | "
                  << std::setw(10) << motorSpeed << " | "
                  << "\n";
          
    }
      time += deltaTime;
      std::this_thread::sleep_for(std::chrono::milliseconds(3000));
  }

  return 0;
}