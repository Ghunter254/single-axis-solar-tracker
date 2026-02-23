#ifndef TELEMETRY_H
#define TELEMETRY_H

#include <Arduino.h>

class Telemetry {
    private:
        unsigned long telemetryInterval;
        unsigned long lastSendTime;
        unsigned long seq;

        float controlHz;
        float telemetryHz;

    public:
        Telemetry();

        void begin(float controlRateHz, float telemetryRateHz);

        void setTelemetryRate(float telemetryRateHz);

        void send(        
        float angle,
        float pot,
        float east,
        float west,
        float error,
        float output,
        float setpoint,
        float kp,
        float ki,
        float kd);
};

#endif