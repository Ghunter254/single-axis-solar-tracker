export interface TelemetryData {
  time: number; // Simulation time (or millis from Arduino)
  angle: number; // Current Panel Angle (0-300)
  sunAngle: number; // Current Sun Angle (0-180)
  deltaL: number; // Error (Left - Right)
  motorSpeed: number; // PWM or Deg/s
  // We compute these on the frontend for the UI:
  voltage?: number;
  power?: number;
}
