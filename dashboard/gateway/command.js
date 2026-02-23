const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const readline = require("readline");

const SERIAL_PORT = "COM4";
const BAUD_RATE = 115200;

const port = new SerialPort({ path: SERIAL_PORT, baudRate: BAUD_RATE });
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

// Telemetry parser (silent)
parser.on("data", (line) => {
  // process telemetry silently
  // e.g., log to file or broadcast
});

// CLI for sending commands
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.on("line", (input) => {
  input = input.trim();
  if (input === "run" || input === "stop") {
    port.write(input + "\n");
  }
});
