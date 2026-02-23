export interface TelemetryData {
  time: number;
  angle: number;
  deltaL: number;
  motorSpeed: number;

  east: number;
  west: number;
  pot: number;
  seq: number;

  sunAngle?: number;
}
