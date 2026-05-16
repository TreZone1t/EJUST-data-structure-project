# 📊 Data Structure Project: Queuing System Simulation
**Spring 2026**

![Project Status](https://img.shields.io/badge/Status-Completed-success)
![Course](https://img.shields.io/badge/Course-Data%20Structures-brightgreen)
![Tech Stack](https://img.shields.io/badge/Stack-C++%20|%20React-blue)

## 👥 Team Members & Contributions
This project was developed collaboratively by the following team members. Each member took ownership of specific modules of the system to ensure an efficient, robust, and scalable implementation.

| Name | ID | Role & Contribution |
| :--- | :---: | :--- |
| **Abdulhakim** | `320250201` | **UI and integration :** Built the interactive dashboard and managed the integration of the full system architecture. |
| **Adam Bahaa Sabry** | `320250186` | **Queue:** Implemented the generic Queue data structure logic and dynamic memory management. |
| **Jana Khaled** | `320250177` | **Server:** Implemented the Server component, queue capacity, and customer processing logic. |
| **Tasbeeh** | `320250199` | **Customer:** Implemented the Customer component, managing arrival and randomized transaction times. |
| **Yahia Elghnaam** | `320250184` | **Device and simulationTick:** Implemented the base Device class and the core simulation tick loop for the engine. |
| **Yehia Eldershaby** | `320250200` | **Run:** Handled the simulation execution, initialization, and running the HTTP backend environment. |

---

## 📌 1. Project Idea: Queuing System Simulation
This project focuses on designing a **simulation system** that models real-life service environments where customers wait in line to receive service, such as banks, hospitals, or call centers. 

The goal of the system is to study and analyze system efficiency by dynamically measuring **waiting time, queue length, and overall service performance**.

### Features Implemented:
* **Customers arriving at different times:** Configurable arrival rates dynamically spawn new customers per simulation tick.
* **A waiting queue following FIFO order:** Developed a generic Node-based Queue data structure in pure C++.
* **Servers providing service to customers:** Multiple servers handle requests and process transaction times simultaneously.
* **System clock controlling the simulation:** A tick-based loop advances the simulation step-by-step.
* **Dynamic Load Balancing:** Automatically directs incoming customers to the server with the shortest queue.

---

## 🏗️ 2. Core Components

### A. The Queue Data Structure (`Queue.h`)
The backbone of this project is a generic, template-based Queue (`Queue<T>`).
* Relies on a custom `Node` struct.
* Maintains pointers to the `front` and `rear` for `O(1)` enqueue and dequeue operations.
* Avoids standard libraries (`std::queue`) to demonstrate pure data structure knowledge.

### B. The Server Component (`Server.h`)
Represents the service windows. 
* Has a maximum queue capacity (`QueueLength`).
* Tracks `totalBusyTime`, `finishTime`, and `totalCustomerServed`.
* Uses the `serveCustomer()` method to lock the server and calculate wait times until the simulated transaction finishes.

### C. The Customer Component (`Customer.h`)
Represents the clients. 
* Generates a random `transactionTime` (service time duration).
* Records timestamps for `arrivalTime`, `windowOpenTime`, and `serviceEndTime` to analyze system performance accurately.

---

## ⚖️ 3. Load Balancing Strategy
Instead of naively filling up the first server before moving to the second, the simulation includes an intelligent distribution algorithm (**Shortest Queue First**). 
* When a batch of customers arrives, the `recommendServer` function scans all active servers.
* It checks for available space (`hasQueueSpace()`).
* It evaluates the current queue length of each server and selects the server with the least load.
* This closely mimics intelligent ticketing systems found in modern banks.

---

## 🌟 4. The Interactive UI Dashboard (Bonus Feature)
To elevate the project beyond a basic console application, we developed a full-stack architecture consisting of:
1. **C++ HTTP Backend:** Listens on port `8081` and accepts configuration parameters via JSON.
2. **React + TypeScript Frontend:** Provides a stunning visual interface. 

**UI Features Include:**
* **Real-time Configuration:** Adjust the number of servers, queue sizes, customer arrival rates, and simulation speeds on the fly.
* **Dynamic Server Layouts:** Visualize servers in Fibonacci, Grid, Line, or Random layouts.
* **Live Performance Analytics:** View real-time KPIs including Average Wait Time, Service Rate, Server Utilization, and Queue Lengths.
* **Customer Drawer:** A detailed data table showing the exact status, queue wait time, and total time spent for every single generated customer.
* **Post-Simulation Report:** Automatically generates a comprehensive analytical report once the simulation finishes.

---

## 🚀 5. How to Run

### Setup the C++ Simulation Engine
Make sure you have a `g++` compiler installed.
```bash
# Navigate to the core directory
cd core

# Compile the C++ program (Windows)
.\build.bat

# Run the backend
./build/simulation.exe
```

### Setup the Frontend Interface
Make sure you have Node.js installed.
```bash
# Open a new terminal and navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the web interface
npm run dev
```

Open the link provided by Vite (e.g., `http://localhost:5173`) in your browser to interact with the simulation!
