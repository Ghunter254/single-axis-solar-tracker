#ifndef MOTOR_H
#define MOTOR_H

class Motor {
public:
    // Set up the motor pins and all that
    Motor();

    // Drive the motor to either direction.
    void drive(int speed);

    // Just stop mahn.
    void stop();
};

#endif