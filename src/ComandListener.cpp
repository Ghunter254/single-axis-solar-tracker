#include "CommandListener.h"

CommandListener::CommandListener() {
    index = 0;
    memset(buffer, 0, BUFFER_SIZE);
}

void CommandListener::begin(unsigned long baudRate) {
    Serial.begin(baudRate);
}

// Non-blocking call: process incoming bytes
void CommandListener::update(Command &cmd) {
    while (Serial.available() > 0) {
        char c = Serial.read();

        // Line termination
        if (c == '\n' || c == '\r') {
            if (index > 0) {
                buffer[index] = '\0';

                // Lightweight parsing
                // Accept either plain command or minimal JSON
                if (strcmp(buffer, "run") == 0 || strstr(buffer, "\"cmd\":\"run\"") != nullptr) {
                    cmd.run = true;
                    cmd.stop = false;
                    Serial.println("✅ Command RUN received");
                } else if (strcmp(buffer, "stop") == 0 || strstr(buffer, "\"cmd\":\"stop\"") != nullptr) {
                    cmd.stop = true;
                    cmd.run = false;
                    Serial.println("⏹ Command STOP received");
                } else {
                    Serial.print("Unknown command: ");
                    Serial.println(buffer);
                }

                // reset buffer
                index = 0;
                memset(buffer, 0, BUFFER_SIZE);
            }
        } else {
            if (index < BUFFER_SIZE - 1) {
                buffer[index++] = c;
            }
        }
    }
}
