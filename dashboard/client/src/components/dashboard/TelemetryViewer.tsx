import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";

type TelemetryPoint = {
  seq: number;
  t: number;
  Scanning: number;
  angle: number;
  pot: number;
  east: number;
  west: number;
  error: number;
  output: number;
  setpoint: number;
  kp: number;
  ki: number;
  kd: number;
  controlHz: number;
  telemetryHz: number;
  totalLight?: number; // Added for charting
};

export default function TelemetryViewer() {
  const [rawText, setRawText] = useState("");

  // 1. Parse Data
  const data: TelemetryPoint[] = useMemo(() => {
    const lines = rawText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const parsed: TelemetryPoint[] = [];

    for (const line of lines) {
      try {
        const point = JSON.parse(line);
        point.totalLight = point.east + point.west;
        parsed.push(point);
      } catch (err) {
        console.log("Malformed line ignored:", err);
      }
    }
    return parsed;
  }, [rawText]);

  // 2. Crunch Metrics
  const metrics = useMemo(() => {
    if (data.length < 2) return null;

    // Find where the scanner finished and handed off to the PID.
    // This is our "Step Input" time (t=0 for the transient response).
    let pidStartIndex = data.findIndex(
      (d, i) => i > 0 && data[i - 1].Scanning === 1 && d.Scanning === 0,
    );
    if (pidStartIndex === -1) pidStartIndex = 0; // Fallback if no scanning phase exists

    const pidData = data.slice(pidStartIndex);
    if (pidData.length === 0) return null;

    const samples = pidData.length;
    const errors = pidData.map((d) => d.error);
    const absErrors = errors.map(Math.abs);
    const outputs = pidData.map((d) => d.output);
    const dtAvg = (pidData[samples - 1].t - pidData[0].t) / 1000 / samples; // average dt in seconds

    // --- Steady-State Metrics ---
    const mae = absErrors.reduce((sum, val) => sum + val, 0) / samples;
    const rmse = Math.sqrt(
      absErrors.reduce((sum, val) => sum + val * val, 0) / samples,
    );

    const deadband = 5.0; // Define what counts as "Locked"
    const lockCount = absErrors.filter((e) => e <= deadband).length;
    const timeInLock = (lockCount / samples) * 100;

    // --- Energy & Actuation Metrics ---
    // Integral of Absolute Control Effort (IACE)
    const iace = outputs.reduce((sum, val) => sum + Math.abs(val) * dtAvg, 0);
    const activeMotorCount = outputs.filter((o) => Math.abs(o) >= 5.0).length; // Account for deadband
    const dutyCycle = (activeMotorCount / samples) * 100;

    const avgTotalLight =
      pidData.reduce((sum, val) => sum + (val.totalLight || 0), 0) / samples;

    // --- Transient Dynamics (Step Response) ---
    const initialError = errors[0];
    let peakOvershoot = 0;
    let percentOvershoot = 0;
    let zeta = 1.0;
    let settlingTimeStr = "Unsettled";

    // Only calculate step response if we actually had a meaningful starting error
    if (Math.abs(initialError) > deadband) {
      const isPositiveStep = initialError > 0;

      for (let i = 1; i < samples; i++) {
        if (isPositiveStep && errors[i] < peakOvershoot)
          peakOvershoot = errors[i];
        if (!isPositiveStep && errors[i] > peakOvershoot)
          peakOvershoot = errors[i];
      }

      percentOvershoot = Math.abs(peakOvershoot / initialError);

      if (percentOvershoot > 0) {
        const lnOS = Math.log(percentOvershoot);
        zeta = -lnOS / Math.sqrt(Math.PI * Math.PI + lnOS * lnOS);
      }

      // Settling time: time until it permanently enters the deadband
      let lastOutlierTime = pidData[0].t;
      for (let i = 0; i < samples; i++) {
        if (Math.abs(errors[i]) > deadband) {
          lastOutlierTime = pidData[i].t;
        }
      }

      if (lastOutlierTime < pidData[samples - 1].t) {
        settlingTimeStr =
          ((lastOutlierTime - pidData[0].t) / 1000).toFixed(2) + "s";
      }
    }

    return {
      samples,
      mae: mae.toFixed(2),
      rmse: rmse.toFixed(2),
      timeInLock: timeInLock.toFixed(1) + "%",
      iace: iace.toFixed(2),
      dutyCycle: dutyCycle.toFixed(1) + "%",
      avgTotalLight: avgTotalLight.toFixed(0),
      initialStep: Math.abs(initialError).toFixed(2),
      overshoot: (percentOvershoot * 100).toFixed(1) + "%",
      zeta: zeta.toFixed(3),
      settlingTime: settlingTimeStr,
    };
  }, [data]);

  // Styling objects for clean presentation
  const tableHeaderStyle = {
    padding: "12px",
    textAlign: "left" as const,
    backgroundColor: "#f3f4f6",
    borderBottom: "2px solid #d1d5db",
    fontWeight: "bold",
  };
  const tableCellStyle = { padding: "12px", borderBottom: "1px solid #e5e7eb" };

  return (
    <div
      style={{
        padding: "20px 40px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#1f2937",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <h2
        style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}
      >
        Solar Digital Twin: Session Analyzer
      </h2>

      <textarea
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        placeholder="Paste JSONL telemetry here..."
        style={{
          width: "100%",
          height: 150,
          marginBottom: 20,
          padding: 10,
          fontFamily: "monospace",
          borderRadius: "8px",
          border: "1px solid #d1d5db",
        }}
      />

      {data.length > 0 && metrics && (
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr", gap: "30px" }}
        >
          {/* PERFORMANCE METRICS TABLE */}
          <div
            style={{
              backgroundColor: "#fff",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "10px",
              }}
            >
              System Performance KPIs
            </h3>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
                marginTop: "10px",
              }}
            >
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Category</th>
                  <th style={tableHeaderStyle}>Metric</th>
                  <th style={tableHeaderStyle}>Value</th>
                  <th style={tableHeaderStyle}>Engineering Meaning</th>
                </tr>
              </thead>
              <tbody>
                {/* Steady State */}
                <tr>
                  <td style={tableCellStyle} rowSpan={3}>
                    <strong>Steady-State Accuracy</strong>
                  </td>
                  <td style={tableCellStyle}>Mean Absolute Error (MAE)</td>
                  <td style={tableCellStyle}>
                    <span style={{ fontWeight: "bold", color: "#047857" }}>
                      {metrics.mae}
                    </span>
                  </td>
                  <td style={tableCellStyle}>
                    Average deviation from perfect sun alignment.
                  </td>
                </tr>
                <tr>
                  <td style={tableCellStyle}>Root Mean Square Error (RMSE)</td>
                  <td style={tableCellStyle}>
                    <strong>{metrics.rmse}</strong>
                  </td>
                  <td style={tableCellStyle}>
                    Penalizes large spikes in error (sensor noise/jitter).
                  </td>
                </tr>
                <tr>
                  <td style={tableCellStyle}>Time-in-Lock</td>
                  <td style={tableCellStyle}>
                    <strong>{metrics.timeInLock}</strong>
                  </td>
                  <td style={tableCellStyle}>
                    % of time spent within the optimal 5.0 error deadband.
                  </td>
                </tr>

                {/* Actuation Cost */}
                <tr>
                  <td style={tableCellStyle} rowSpan={3}>
                    <strong>Energy & Actuation</strong>
                  </td>
                  <td style={tableCellStyle}>Actuation Duty Cycle</td>
                  <td style={tableCellStyle}>
                    <strong>{metrics.dutyCycle}</strong>
                  </td>
                  <td style={tableCellStyle}>
                    % of time the motor was drawing power. Lower is better.
                  </td>
                </tr>
                <tr>
                  <td style={tableCellStyle}>Control Effort (IACE)</td>
                  <td style={tableCellStyle}>
                    <strong>{metrics.iace}</strong>
                  </td>
                  <td style={tableCellStyle}>
                    Total mathematical work requested by the PID.
                  </td>
                </tr>
                <tr>
                  <td style={tableCellStyle}>Avg Total Irradiance</td>
                  <td style={tableCellStyle}>
                    <span style={{ fontWeight: "bold", color: "#d97706" }}>
                      {metrics.avgTotalLight}
                    </span>{" "}
                    ADC
                  </td>
                  <td style={tableCellStyle}>
                    Total light gathered (East + West). The ultimate goal.
                  </td>
                </tr>

                {/* Transient Dynamics */}
                <tr>
                  <td style={tableCellStyle} rowSpan={3}>
                    <strong>Transient Dynamics</strong>
                    <br />
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      (Calculated from step error: {metrics.initialStep})
                    </span>
                  </td>
                  <td style={tableCellStyle}>Settling Time ($T_s$)</td>
                  <td style={tableCellStyle}>
                    <strong>{metrics.settlingTime}</strong>
                  </td>
                  <td style={tableCellStyle}>
                    Time taken to securely lock onto the sun after handover.
                  </td>
                </tr>
                <tr>
                  <td style={tableCellStyle}>Percent Overshoot (%OS)</td>
                  <td style={tableCellStyle}>
                    <strong>{metrics.overshoot}</strong>
                  </td>
                  <td style={tableCellStyle}>
                    Did the panel swing past the sun? Indicates high Kp.
                  </td>
                </tr>
                <tr>
                  <td style={tableCellStyle}>Damping Ratio ($\zeta$)</td>
                  <td style={tableCellStyle}>
                    <span style={{ fontWeight: "bold", color: "#4338ca" }}>
                      {metrics.zeta}
                    </span>
                  </td>
                  <td style={tableCellStyle}>
                    $\zeta \approx 0.7$ is optimal. $\zeta = 1$ is no overshoot.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* CHARTS */}
          <div
            style={{
              backgroundColor: "#fff",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Kinematics & Control Effort</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="seq" />
                <YAxis
                  yAxisId="left"
                  domain={["dataMin - 10", "dataMax + 10"]}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[-110, 110]}
                />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="angle"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  name="Panel Angle (°)"
                />
                <Area
                  yAxisId="right"
                  type="step"
                  dataKey="output"
                  fill="#ef4444"
                  stroke="#ef4444"
                  fillOpacity={0.2}
                  name="Motor Output (PWM)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              backgroundColor: "#fff",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Irradiance (Light Gathering)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="seq" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalLight"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  name="Total Light"
                />
                <Line
                  type="monotone"
                  dataKey="east"
                  stroke="#10b981"
                  dot={false}
                  name="East Sensor"
                />
                <Line
                  type="monotone"
                  dataKey="west"
                  stroke="#8b5cf6"
                  dot={false}
                  name="West Sensor"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              backgroundColor: "#fff",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Error Tracking & Scanner State</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="seq" />
                <YAxis yAxisId="left" />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 1.5]}
                  ticks={[0, 1]}
                />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="error"
                  stroke="#ec4899"
                  strokeWidth={2}
                  dot={false}
                  name="PID Error"
                />
                <Area
                  yAxisId="right"
                  type="step"
                  dataKey="Scanning"
                  fill="#fcd34d"
                  stroke="#fbbf24"
                  fillOpacity={0.3}
                  name="Scanner Active"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
