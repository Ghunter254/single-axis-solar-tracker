import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Wifi } from "lucide-react";
import SolarScene from "./SolarScene";
import { useTelemetry } from "@/hooks/useTelemetry";

const LOCK_THRESHOLD = 5;
const MAX_POT_ADC = 1023.0;
const MAX_ANGLE_DEG = 320.0;

const Dashboard = () => {
  const { data, sessionData, isConnected } = useTelemetry();

  const currentInferredAngle = (data.pot / MAX_POT_ADC) * MAX_ANGLE_DEG;

  const samples = sessionData.length;

  let meanError = 0;
  let rmsError = 0;
  let variance = 0;
  let controlEffort = 0;
  let lockPercentage = 0;
  let sessionTime = 0;
  let energy = 0;

  let initialStepError = 0;
  let overshootPercentage = 0;
  let dampingRatio = 1.0;
  let settlingTimeMs = 0;

  if (samples > 1) {
    const errors = sessionData.map((d) => d.deltaL);
    const absErrors = errors.map(Math.abs);

    const angles = sessionData.map(
      (d) => (d.pot / MAX_POT_ADC) * MAX_ANGLE_DEG,
    );

    meanError = absErrors.reduce((a, b) => a + b, 0) / samples;
    rmsError = Math.sqrt(absErrors.reduce((a, b) => a + b * b, 0) / samples);
    const meanAngle = angles.reduce((a, b) => a + b, 0) / samples;
    variance =
      angles.reduce((sum, a) => sum + (a - meanAngle) ** 2, 0) / samples;
    controlEffort =
      sessionData.reduce((sum, d) => sum + Math.abs(d.motorSpeed), 0) / samples;

    const lockCount = sessionData.filter(
      (d) => Math.abs(d.deltaL) < LOCK_THRESHOLD,
    ).length;
    lockPercentage = (lockCount / samples) * 100;
    sessionTime = sessionData[samples - 1].time - sessionData[0].time;

    // Energy integration (Rough estimation of power available based on LDRs)
    for (let i = 1; i < samples; i++) {
      const dt = (sessionData[i].time - sessionData[i - 1].time) / 1000;
      const power = (sessionData[i].east + sessionData[i].west) / 2;
      energy += power * dt;
    }

    // Since the session STARTS with an induced error, index 0 is our Step Input.
    initialStepError = errors[0];
    const absInitialStep = Math.abs(initialStepError);

    if (absInitialStep > LOCK_THRESHOLD) {
      const isPositiveStep = initialStepError > 0;
      let peakOvershoot = 0;

      // Find Overshoot (Did it cross 0 and go the other way?)
      for (let i = 1; i < samples; i++) {
        if (isPositiveStep && errors[i] < peakOvershoot)
          peakOvershoot = errors[i];
        if (!isPositiveStep && errors[i] > peakOvershoot)
          peakOvershoot = errors[i];
      }

      // Calculate Overshoot %
      overshootPercentage = Math.abs(peakOvershoot / absInitialStep);

      // Calculate Damping Ratio (Zeta)
      if (overshootPercentage > 0) {
        // Zeta formula: -ln(OS) / sqrt(pi^2 + ln(OS)^2)
        const lnOS = Math.log(overshootPercentage);
        dampingRatio = -lnOS / Math.sqrt(Math.PI * Math.PI + lnOS * lnOS);
      } else {
        dampingRatio = 1.0; // Overdamped or Critically damped
      }

      // Calculate Settling Time (Time until it permanently enters the 5% error band)
      const settlingBand = absInitialStep * 0.05; // 5% of the initial induced error
      let lastOutlierTime = sessionData[0].time;

      for (let i = 0; i < samples; i++) {
        if (Math.abs(errors[i]) > settlingBand) {
          lastOutlierTime = sessionData[i].time;
        }
      }

      // If the last outlier is NOT the current time, it has successfully settled.
      if (lastOutlierTime < sessionData[samples - 1].time) {
        settlingTimeMs = lastOutlierTime - sessionData[0].time;
      }
    }
  }

  // ---------- DOWNLOAD REPORT ----------
  const downloadReport = () => {
    const report = {
      samples,
      sessionTimeMs: sessionTime,
      meanAbsoluteError: meanError,
      rmsError,
      angleVariance: variance,
      controlEffort,
      lockPercentage,
      estimatedEnergy: energy,
      transient: {
        inducedStepError: initialStepError,
        overshootPercent: overshootPercentage * 100,
        dampingRatio,
        settlingTimeMs,
      },
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "session-summary.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Digital Twin Analytics
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition"
          >
            <Download className="h-4 w-4" />
            Download Report
          </button>
          <div
            className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${isConnected ? "bg-green-100 border-green-200" : "bg-red-100 border-red-200"}`}
          >
            <Wifi
              className={`h-4 w-4 ${isConnected ? "text-green-600" : "text-red-600"}`}
            />
            <span
              className={`text-sm font-medium ${isConnected ? "text-green-700" : "text-red-700"}`}
            >
              {isConnected ? "Gateway Online" : "Disconnected"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* 3D SCENE */}
        <div className="lg:col-span-2 h-150">
          <SolarScene
            panelAngle={currentInferredAngle}
            sunAngle={data.sunAngle || 150}
          />
        </div>

        {/* METRIC CARDS */}
        <div className="space-y-4 max-h-150  overflow-y-auto pr-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Live Telemetry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Potentiometer:</span>{" "}
                <span className="font-mono">{data.pot} ADC</span>
              </div>
              <div className="flex justify-between">
                <span>Inferred Angle:</span>{" "}
                <span className="font-mono">
                  {currentInferredAngle.toFixed(2)}°
                </span>
              </div>
              <div className="flex justify-between">
                <span>PID Error (ΔL):</span>{" "}
                <span className="font-mono">{data.deltaL.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Motor Output:</span>{" "}
                <span className="font-mono">{data.motorSpeed.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Transient Response</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Damping Ratio (ζ):</span>{" "}
                <span className="font-mono">{dampingRatio.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span>Overshoot:</span>{" "}
                <span className="font-mono">
                  {(overshootPercentage * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Settling Time:</span>{" "}
                <span className="font-mono">
                  {settlingTimeMs > 0
                    ? `${(settlingTimeMs / 1000).toFixed(2)}s`
                    : "Unsettled"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Initial Step Error:</span>{" "}
                <span className="font-mono">
                  {Math.abs(initialStepError).toFixed(1)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Tracking Quality</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Samples:</span>{" "}
                <span className="font-mono">{samples}</span>
              </div>
              <div className="flex justify-between">
                <span>MAE:</span>{" "}
                <span className="font-mono">{meanError.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>RMS Error:</span>{" "}
                <span className="font-mono">{rmsError.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Time in Lock:</span>{" "}
                <span className="font-mono">{lockPercentage.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Control Stability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Angle Variance:</span>{" "}
                <span className="font-mono">{variance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Control Effort:</span>{" "}
                <span className="font-mono">{controlEffort.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
