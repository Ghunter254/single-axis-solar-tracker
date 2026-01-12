import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Activity, Gauge, Wifi } from "lucide-react";
import SolarScene from "./SolarScene";
import { useTelemetry } from "@/hooks/useTelemetry";

const Dashboard = () => {
  // 1. Get Real Data
  const { data, isConnected } = useTelemetry();

  // 2. Lock in Real Positions (No Estimation)
  // We use the exact Sun Angle from the C++ "God Mode" data.
  // If data.sunAngle is undefined (old C++ binary), default to 150 (Stagnant).
  const sunPos = data.sunAngle ?? 150;

  // Fake Power Logic (Just for visuals)
  const isLocked = Math.abs(data.deltaL) < 50;
  const efficiency = isLocked
    ? 98.5
    : Math.max(0, 100 - Math.abs(data.deltaL / 10));
  const powerOutput = (efficiency * 0.18).toFixed(1);

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Digital Twin</h2>

        {/* Connection Status Badge */}
        <div
          className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${
            isConnected
              ? "bg-green-100 border-green-200"
              : "bg-red-100 border-red-200"
          }`}
        >
          <Wifi
            className={`h-4 w-4 ${
              isConnected ? "text-green-600" : "text-red-600"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              isConnected ? "text-green-700" : "text-red-700"
            }`}
          >
            {isConnected ? "Gateway Online" : "Disconnected"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* --- 3D SCENE (Driven by Real Data) --- */}
        <div className="lg:col-span-2 relative group h-125">
          {/* PASS THE LOCKED SUN POSITION HERE */}
          <SolarScene panelAngle={data.angle} sunAngle={sunPos} />

          {/* Live Data Overlay */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-md text-xs font-mono border border-white/10">
              PANEL: {data.angle.toFixed(2)}°
            </div>
            <div className="bg-black/60 backdrop-blur-md text-yellow-400 px-3 py-1 rounded-md text-xs font-mono border border-white/10">
              SUN (TARGET): {sunPos.toFixed(2)}°
            </div>
          </div>
        </div>

        {/* --- METRICS --- */}
        <div className="space-y-4">
          {/* Power Output */}
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Power Output
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                {powerOutput}
                <span className="text-lg text-muted-foreground font-normal">
                  W
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-yellow-500 h-full transition-all duration-300"
                  style={{ width: `${efficiency}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* PID Error (Delta L) */}
          <Card
            className={`border-l-4 ${
              isLocked ? "border-l-green-500" : "border-l-red-500"
            }`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                Sensor Error (Delta L)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-700">
                {data.deltaL.toFixed(0)}
              </div>
              <p
                className={`text-xs font-bold mt-1 ${
                  isLocked ? "text-green-600" : "text-red-500"
                }`}
              >
                {isLocked ? "TARGET LOCKED" : "SEEKING..."}
              </p>
            </CardContent>
          </Card>

          {/* Motor Speed */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                Motor Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.abs(data.motorSpeed).toFixed(1)}{" "}
                <span className="text-sm text-muted-foreground">deg/s</span>
              </div>
              <p className="text-xs text-muted-foreground">PID Output</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
