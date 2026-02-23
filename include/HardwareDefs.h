#ifndef HARDWARE_DEFS_H
#define HARDWARE_DEFS_H
 
#define PIN_MOTOR_IN1 3
#define PIN_MOTOR_IN2 4

#define PIN_LDR_EAST A1
#define PIN_LDR_WEST A2
#define PIN_POT      A0

#define LDR_THRESHOLD 5
#define POT_READING_MAX 1000
#define POT_READING_MIN 20

// PID constants.
#define KP 0.2
#define KI 0.5
#define KD 1.0  

// Feedforward constants
#define SUN_VELOCITY 0.00417 // Degrees per second.
#define FF_GAIN 20.0

#define MAX_SPEED 100
#endif