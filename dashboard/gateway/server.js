const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Config
const SERIAL_PORT = "COM4";
const BAUD_RATE = 115200;

const LOG_DIR = path.join(__dirname, "sessions");
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

const sessionFileName = `session_${Date.now()}.jsonl`;
const sessionPath = path.join(LOG_DIR, sessionFileName);
const logStream = fs.createWriteStream(sessionPath, { flags: "a" });

console.log("Session log file:", sessionPath);

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Telemetry state
let isRunning = false;
let lastSeq = null;
let packetCount = 0;
let droppedPackets = 0;

// --- Telemetry handler ---
const broadcastTelemetry = (dataString) => {
  if (!isRunning) return; // ignore if not running

  const trimmed = dataString.trim();
  if (!trimmed) return;

  try {
    const jsonData = JSON.parse(trimmed);

    // Sequence check
    if (jsonData.seq !== undefined) {
      if (lastSeq !== null && jsonData.seq !== lastSeq + 1) {
        droppedPackets += jsonData.seq - lastSeq - 1;
        console.warn("⚠ Sequence jump:", lastSeq, "→", jsonData.seq);
      }
      lastSeq = jsonData.seq;
    }

    packetCount++;
    logStream.write(trimmed + "\n");
    const mapped = {
      time: jsonData.t,
      angle: jsonData.angle,
      sunAngle: 0,
      deltaL: jsonData.error,
      motorSpeed: jsonData.output,
      east: jsonData.east,
      west: jsonData.west,
      pot: jsonData.pot,
      seq: jsonData.seq,
    };

    io.emit("telemetry", mapped);

    if (packetCount % 100 === 0) {
      console.log(
        `Packets logged: ${packetCount} | Dropped: ${droppedPackets}`,
      );
    }
  } catch (e) {
    console.log("Non-JSON line:", trimmed);
  }
};

// --- Serial Port ---
const port = new SerialPort({ path: SERIAL_PORT, baudRate: BAUD_RATE });
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

parser.on("data", broadcastTelemetry);

port.on("error", (err) => {
  console.error("Serial Error:", err.message);
});

// --- CLI for commands ---
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.on("line", (input) => {
  input = input.trim().toLowerCase();
  if (input === "run") {
    isRunning = true;
    port.write("run\n");
    console.log("✅ Logging started, command RUN sent");
  } else if (input === "stop") {
    isRunning = false;
    port.write("stop\n");
    console.log("⏹ Logging stopped, command STOP sent");
  } else {
    console.log("Only 'run' or 'stop' commands accepted");
  }
});

// --- Graceful shutdown ---
process.on("SIGINT", () => {
  console.log("\nShutting down...");
  console.log(`Packets logged: ${packetCount}`);
  console.log(`Dropped packets: ${droppedPackets}`);
  logStream.end();
  port.write("stop\n"); // ensure Arduino stops
  process.exit();
});

// --- Server ---
server.listen(3000, () => {
  console.log("Gateway running on http://localhost:3000");
  console.log("Type 'run' to start logging, 'stop' to pause");
});
