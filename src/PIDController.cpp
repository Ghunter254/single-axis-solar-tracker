#include "PIDController.h"

// Constructor

PIDController::PIDController(double pGain, double iGain, double dGain, double maxOut)
    : Kp(pGain), Ki(iGain), Kd(dGain), previousError(0.0), integral(0.0), maxOutput(maxOut), filteredDerivative(0.0),
      derivativeAlpha(0.8) {}

double PIDController::compute(double error, double deltaTime) {


    // Proportional term
    double Pout = Kp * error;

    // Integral term
    integral += error * deltaTime;

    // cap the integral. 50%
    double maxIntegral = maxOutput * 0.5;

    double Iout = 0;

    if (Ki > 0 ) {
        double potentialI = Ki * integral;

        if (potentialI > maxIntegral) integral = maxIntegral / Ki;
        else if (potentialI < -maxIntegral) integral = - maxIntegral/Ki;

        Iout = Ki * integral;
    }

    // Derivative term
    double derivative = 0.0;

    if (deltaTime > 0.0 ) {
        derivative = (error - previousError) / deltaTime;

        filteredDerivative = derivativeAlpha * filteredDerivative
                        + (1.0 - derivativeAlpha) * derivative;

    }

    double Dout = Kd * filteredDerivative;

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

void PIDController::reset() {
    previousError = 0.0;
    integral = 0.0;
}