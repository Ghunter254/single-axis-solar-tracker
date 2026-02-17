#include "PIDController.h"

// Constructor

PIDController::PIDController(double pGain, double iGain, double dGain, double maxOut)
    : Kp(pGain), Ki(iGain), Kd(dGain), previousError(0.0), integral(0.0), maxOutput(maxOut) {}

double PIDController::compute(double desiredAngle, double measuredAngle, double deltaTime) {

    double error = desiredAngle - measuredAngle;

    // Proportional term
    double Pout = Kp * error;

    // Integral term
    integral += error * deltaTime;
    double Iout = Ki * integral;

    // Derivative term
    double derivative = (error - previousError) / deltaTime;
    double Dout = Kd * derivative;

    // Total output
    double output = Pout + Iout + Dout;

    // Clamp output to max limits
    if (output > maxOutput) {
        output = maxOutput;
    } else if (output < -maxOutput) {
        output = -maxOutput;
    }

    // Save error for next derivative calculation
    previousError = error;

    return output;

}