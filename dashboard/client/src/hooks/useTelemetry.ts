import type { TelemetryData } from "@/types";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

export const useTelemetry = () => {
  const [data, setData] = useState<TelemetryData>({
    time: 0,
    angle: 120,
    deltaL: 0,
    motorSpeed: 0,
    east: 0,
    west: 0,
    pot: 0,
    seq: 0,
  });

  const [sessionData, setSessionData] = useState<TelemetryData[]>([]);
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
      setSessionData((prev) => [...prev, newData]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { data, sessionData, isConnected };
};
