const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const { spawn } = require("child_process");

// CONFIG
const SERIAL_PORT = "COM3";
const BAUD_RATE = 9600;
const SIM_EXEC_PATH = "../../.pio/build/native/program.exe";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// --- ARGUMENT PARSER ---
// Run with: "node server.js --sim" to use C++ simulation
// Run with: "node server.js" to use Real Arduino
const USE_SIMULATION = process.argv.includes("--sim");

// This function sends data to the frontend, regardless of where it came from
const broadcastTelemetry = (dataString) => {
  try {
    const jsonData = JSON.parse(dataString);
    io.emit("telemetry", jsonData);
    console.log("Data:", jsonData);
  } catch (e) {
    console.log("Raw:", dataString); // Debug non-JSON lines
  }
};

if (USE_SIMULATION) {
  console.log("STARTING C++ SIMULATION MODE...");

  // Spawn the C++ executable
  const simulation = spawn(SIM_EXEC_PATH);

  simulation.stdout.on("data", (data) => {
    // Data might come in chunks, split by newline
    const lines = data.toString().split("\n");
    lines.forEach((line) => {
      if (line.trim()) broadcastTelemetry(line);
    });
  });

  simulation.stderr.on("data", (data) => {
    console.error(`C++ Error: ${data}`);
  });

  simulation.on("close", (code) => {
    console.log(`Simulation ended with code ${code}`);
  });
} else {
  console.log(`STARTING SERIAL MODE on ${SERIAL_PORT}...`);

  // Serial Port Logic (Existing)
  const port = new SerialPort({ path: SERIAL_PORT, baudRate: BAUD_RATE });
  const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

  parser.on("data", broadcastTelemetry);

  port.on("error", (err) => {
    console.error("Serial Error:", err.message);
    console.log('Hint: connect hardware or run "node server.js --sim"');
  });
}

server.listen(3000, () => {
  console.log("Gateway running on http://localhost:3000");
});
