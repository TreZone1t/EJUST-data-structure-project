![Project Status](https://img.shields.io/badge/Status-In%20Development-blue)
![Course](https://img.shields.io/badge/Course-Data%20Structures-brightgreen)
![Tech Stack](https://img.shields.io/badge/Stack-C++%20|%20React-orange)

## 📌 Project Overview
This project is a comprehensive **Queuing System Simulation** designed to model real-life service environments (such as banks, hospitals, or call centers) where customers wait in line to receive service. It utilizes a custom-built **FIFO Queue data structure** in C++ to simulate customer arrivals, waiting times, and service durations.

To enhance the user experience and achieve bonus requirements, the core C++ simulation is integrated with a modern **React-based Web UI** using **React Flow** for a drag-and-drop interactive canvas, bridged together by a **Node.js/Express** backend[cite: 1].

## ✨ Key Features
* **Core Data Structures:** Custom implementation of a Queue data structure in C++ from scratch[cite: 1].
* **System Clock Simulation:** Models customers arriving at different times and getting served by multiple servers[cite: 1].
* **Performance Analytics:** Calculates System Efficiency, Average Waiting Time, Max Queue Length, and Server Utilization[cite: 1].
* **Interactive UI (Bonus):** A visual drag-and-drop dashboard to dynamically add servers and customers[cite: 1].
* **Full-Stack Integration:** Seamless communication between C++ binaries and Web interfaces using JSON and `child_process`.

---

## 🛠️ Technology Stack
* **Simulation Core:** `C++` (Compiled via g++)
* **Backend Bridge:** `Node.js`, `Express.js`, `child_process`
* **Frontend UI:** `React.js` (Vite), `Tailwind CSS`, `@xyflow/react` (React Flow)

---

## ⚙️ Prerequisites
Before you begin, ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v16 or higher)
* `g++` compiler (MinGW for Windows or equivalent for Mac/Linux)
* Git

---

## 🚀 Installation & Setup

This repository is structured as a Monorepo. You need to set up the three parts: C++ Core, Backend, and Frontend.

### 1. Compile the C++ Core
The backend requires the C++ executable to run the simulation.
```bash
cd cpp_core
# For Windows:
.\build.bat
# For Mac/Linux:
mkdir build && g++ src/*.cpp -o build/simulation.exe
2. Setup the Backend
Open a new terminal window:

Bash
cd backend
npm install
npm run dev
The backend server will start on http://localhost:5000.

3. Setup the Frontend
Open another terminal window:

Bash
cd frontend
npm install
npm run dev
The React app will open in your default browser.

🎯 How to Use
Open the Frontend UI in your browser.

Use the Drag and Drop sidebar to place servers and specify the customer arrival rate on the canvas.

Click "Run Simulation".

The React app sends the parameters to the Express server, which executes the C++ core.

The C++ core calculates the metrics and returns them as a JSON object.

View the generated charts and statistics (Waiting Time, Queue Length, etc.) on the dashboard.



Note to Evaluators: This project includes bonus features such as an interactive UI and external full-stack integration[cite: 1]. Please ensure both the backend and frontend servers are running to experience the full capabilities.
