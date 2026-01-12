

#ifndef PIDCONTROLLER_H
#define PIDCONTROLLER_H

class PIDController {
    private: 
        double Kp; // Proportional gain
        double Ki; // Integral gain
        double Kd; // Derivative gain

        double previousError; // To store the previous error value
        double integral; // To accumulate the integral of the error
        double maxOutput; // Maximum output limit

    public:
        PIDController(double pGain, double iGain, double dGain, double maxOut);

        double compute(double desiredAngle, double measuredAngle, double deltaTime);
};

#endif