#ifndef MOTOR_H
#define MOTOR_H

class Motor {

private:
     unsigned long windowStartTime;
     const unsigned long windowSize = 2000;
public:
    // Set up the motor pins and all that
    Motor();

    // Drive the motor to either direction.
    void drive(int speed, double potReadings);

    // Just stop mahn.
    void stop();
};

#endif