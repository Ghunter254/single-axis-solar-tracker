
# Solar Tracker Control System (PID Simulation)

This project simulates a **Closed-Loop Control System** for a Dual-Axis Solar Tracker. It models the physics of LDR sensors, a DC motor, and a potentiometer to test PID control algorithms before deploying to real hardware.

## 🚀 Quick Start

### Prerequisites
* **VS Code** with the **PlatformIO** extension installed.
* A C++ compiler (MinGW for Windows, Clang/GCC for Mac/Linux).

### How to Run the Simulation
1.  Open the project in VS Code.
2.  Open a terminal in VS Code.
3.  Run the build command for the native environment:
    ```bash
    pio run -e native
    ```
4.  Execute the compiled program:
    * **Windows:**
        ```powershell
        .\.pio\build\native\program.exe
        ```
    * **Mac/Linux:**
        ```bash
        ./.pio/build/native/program
        ```

---

## ⚙️ How to Tune the Controller

The simulation is currently set up in `src/main.cpp`. Your goal is to adjust the **PID Constants** to make the solar panel lock onto the sun (150°) smoothly without shaking.

Look for this section in `main.cpp`:

```cpp
// --- CONTROL PARAMETERS (THE KNOBS) ---
double Kp = 0.05;     // Proportional Gain (Strength)
double Ki = 0.01;     // Integral Gain (Patience)
double Kd = 0.07;     // Derivative Gain (Braking)
double maxSpeed = 10; // Motor Speed Limit (Degrees per second)

```

### variable Guide

| Variable | Symbol | What it does | Effect if too High | Effect if too Low |
| --- | --- | --- | --- | --- |
| **`Kp`** |  | **Strength.** How hard the motor pushes based on current error. | Violent shaking, overshooting. | Motor doesn't move or moves too slowly. |
| **`Ki`** |  | **Patience.** Accumulates error over time to fix small gaps. | Instability, runaway speed over time. | Robot stops *near* the sun but never *on* it. |
| **`Kd`** |  | **Brakes.** Reacts to how fast the error is changing. | "Jittery" movement, stop-and-go jerking. | Overshoots the target and swings back. |
| **`maxSpeed`** | - | **Physical Limit.** The max speed of our real DC motor. | Simulation becomes unrealistic. | System reacts too slowly. |

### 🧪 Tuning Strategy (Try this!)

1. **Reset:** Set `Ki = 0` and `Kd = 0`. Start with a small `Kp` (e.g., 0.01).
2. **Find P:** Increase `Kp` until the system oscillates (wobbles around the target) or reaches it reasonably fast.
3. **Add D:** Increase `Kd` slightly to stop the overshoot/wobble. Think of this as adding shock absorbers.
4. **Add I:** If the panel stops at 149.5° and refuses to move the last 0.5°, add a tiny bit of `Ki` (e.g., 0.001).

---

## 📂 Project Structure

* **`src/main.cpp`**: The main simulation loop. This is where you change parameters.
* **`lib/SensorModel`**: Simulates the physics of the LDRs and the Sun. It calculates how much light hits the sensors based on angles.
* **`lib/PIDController`**: The brain. Contains the standard PID equation:


* **`lib/TrackerCore`**: Hardware abstraction. Converts raw analog readings (0-1023) into meaningful degrees (0-300°).

## 📊 Expected Output

When you run the program, you will see a time-step log.

* **Positive Error:** Sun is to the "Right" -> Motor should have positive speed.
* **Negative Error:** Sun is to the "Left" -> Motor should have negative speed.
* **LOCKED:** The system is close enough to the target (error < 10).

```text
Time(s) | Panel Angle | Error (DeltaL) | Motor Speed | Status
-------------------------------------------------------------
 0.00s |    120.00° |        -915.18 |      10.00 | Moving
 ...
 5.50s |    150.01° |          -0.05 |       0.00 | LOCKED

```

