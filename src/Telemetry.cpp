#include "Telemetry.h"


Telemetry::Telemetry(){
    telemetryInterval = 100;
    lastSendTime = 0;
    seq = 0;
    controlHz = 20.0;
    telemetryHz = 20.0;
}

void Telemetry::begin(float controlRateHz, float telemetryRateHz){
    controlHz = controlRateHz;
    setTelemetryRate(telemetryRateHz);
}

void Telemetry::setTelemetryRate(float telemetryRateHz){
    telemetryHz = telemetryRateHz;
    telemetryInterval = (unsigned long)(1000.0 / telemetryHz);
}

void Telemetry::send(
    bool scanFinished,
    float angle,
    float pot,
    float east,
    float west,
    float error,
    float output,
    float setpoint,
    float kp,
    float ki,
    float kd
) {
    unsigned long now = millis();

    if (now - lastSendTime < telemetryInterval) {
        return;
    }

    lastSendTime = now;
    seq++;

    Serial.print("{");
    Serial.print("\"seq\":"); Serial.print(seq); Serial.print(",");
    Serial.print("\"t\":"); Serial.print(now); Serial.print(",");
    Serial.print("\"Scanning\":"); Serial.print(scanFinished); Serial.print(",");
    Serial.print("\"angle\":"); Serial.print(angle, 4); Serial.print(",");
    Serial.print("\"pot\":"); Serial.print(pot, 4); Serial.print(",");
    Serial.print("\"east\":"); Serial.print(east, 4); Serial.print(",");
    Serial.print("\"west\":"); Serial.print(west, 4); Serial.print(",");
    Serial.print("\"error\":"); Serial.print(error, 4); Serial.print(",");
    Serial.print("\"output\":"); Serial.print(output, 4); Serial.print(",");
    Serial.print("\"setpoint\":"); Serial.print(setpoint, 4); Serial.print(",");
    Serial.print("\"kp\":"); Serial.print(kp, 4); Serial.print(",");
    Serial.print("\"ki\":"); Serial.print(ki, 4); Serial.print(",");
    Serial.print("\"kd\":"); Serial.print(kd, 4); Serial.print(",");
    Serial.print("\"controlHz\":"); Serial.print(controlHz, 2); Serial.print(",");
    Serial.print("\"telemetryHz\":"); Serial.print(telemetryHz, 2);
    Serial.println("}");
    
}