import type { TelemetryData } from "@/types";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

export const useTelemetry = () => {
  const [data, setData] = useState<TelemetryData>({
    time: 0,
    angle: 120, // Start at initial position
    sunAngle: 0,
    deltaL: 0,
    motorSpeed: 0,
  });

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log("✅ Connected to Gateway");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from Gateway");
      setIsConnected(false);
    });

    socket.on("telemetry", (newData: TelemetryData) => {
      setData(newData);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  console.log("Telemetry Data:", data);

  return { data, isConnected };
};
