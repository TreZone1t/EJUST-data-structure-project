# 📊 Data Structure Project: Queuing System Simulation
**Spring 2026**

![Project Status](https://img.shields.io/badge/Status-Completed-success)
![Course](https://img.shields.io/badge/Course-Data%20Structures-brightgreen)
![Tech Stack](https://img.shields.io/badge/Stack-C++%20|%20React-blue)

## 🎯 1. Project Objectives & Educational Goals
This project was developed as a comprehensive assignment for the Data Structures course. The primary objective is to build a robust **Queuing System Simulation** that models real-world service environments (such as banks, hospitals, or customer service centers).

By building this system from the ground up, the team successfully demonstrated:
- Deep understanding of fundamental data structures, specifically **First-In-First-Out (FIFO) Queues**.
- Mastery of object-oriented programming (OOP) principles in C++ (Inheritance, Encapsulation).
- Implementation of dynamic memory management without relying on standard template libraries (STL) like `std::queue`.
- The ability to bridge low-level C++ simulation engines with modern Web UI frameworks via RESTful APIs.

---

## 👥 2. Team Members & Contributions
This project was developed collaboratively by the following team members. Each member took ownership of specific modules of the system to ensure an efficient, robust, and scalable implementation.

| Name | ID | Role & Contribution |
| :--- | :---: | :--- |
| **Abdulhakim** | `320250201` | **UI and integration:** Built the interactive dashboard and managed the integration of the full system architecture, bridging C++ with React. |
| **Adam Bahaa Sabry** | `320250186` | **Queue:** Implemented the generic Queue data structure logic and dynamic memory management. |
| **Jana Khaled** | `320250177` | **Server:** Implemented the Server component, queue capacity, and customer processing logic. |
| **Tasbeeh** | `320250199` | **Customer:** Implemented the Customer component, managing arrival and randomized transaction times. |
| **Yahia Elghnaam** | `320250184` | **Device and simulationTick:** Implemented the base Device class and the core simulation tick loop for the engine. |
| **Yehia Eldershaby** | `320250200` | **Run:** Handled the simulation execution, initialization, and running the HTTP backend environment. |

---

## 🏗️ 3. Core Technical Components

### A. The Queue Data Structure (`Queue.h`)
The backbone of this project is a generic, template-based Queue (`Queue<T>`).
* **Custom Node Implementation:** Relies on a custom `Node` struct storing data and a pointer to the next element.
* **O(1) Time Complexity:** Maintains explicit pointers to the `front` and `rear`, ensuring that `enqueue()` and `dequeue()` operations execute in constant time.
* **Deep Copying:** Includes custom copy constructors and assignment operators to handle deep memory copies safely.

### B. The Server Component (`Server.h`)
Represents the service windows or cashiers. 
* **State Management:** Tracks `isBusyFlag`, `finishTime`, and `totalCustomerServed`.
* **Queue Capacity:** Each server has a strict maximum queue limit (`QueueLength`).
* **Service Logic:** The `serveCustomer()` method locks the server, calculates wait times by comparing the system's current time with the customer's arrival time, and sets a simulated transaction end time.

### C. The Customer Component (`Customer.h`)
Represents the clients traversing the system. 
* **Transaction Time:** Automatically generates a randomized `transactionTime` (service duration) upon instantiation.
* **Lifecycle Tracking:** Records precise timestamps for `arrivalTime`, `windowOpenTime` (when service begins), and `serviceEndTime`. This data is critical for generating the final analytical report.

### D. The Simulation Engine (`simulationTick`)
The heart of the system is the discrete-event clock managed by `simulationTick`.
* **System Clock:** Advances step-by-step. At each tick, the system evaluates all states.
* **Spawning Logic:** Generates new customers dynamically based on the configured `arrival_rate`.
* **State Transitions:** Automatically frees servers whose `finishTime` has been reached, archives the completed customers, and begins serving the next customer in line.

---

## ⚖️ 4. Load Balancing Strategy (Shortest Queue First)
Instead of naively filling up the first server before moving to the second, the simulation includes an intelligent distribution algorithm to prevent bottlenecks.

* **Dynamic Assessment:** When a batch of customers arrives, the `recommendServer` function scans all active servers.
* **Capacity Check:** It filters out any servers that have reached their maximum queue capacity (`!hasQueueSpace()`).
* **Shortest Queue First (SQF):** It evaluates the current queue length of each available server (`getQueueLength()`) and assigns the customer to the server with the absolute minimum load.
* **Real-World Parity:** This closely mimics intelligent automated ticketing systems found in modern banks and government offices.

---

## 🌟 5. The Interactive UI Dashboard (Bonus Feature)
To elevate the project beyond a basic console application, we developed a full-stack architecture. This transforms raw C++ simulation data into a highly visual, interactive experience.

1. **C++ HTTP Backend:** Uses the `cpp-httplib` library to host a local REST API on port `8081`. It exposes endpoints like `POST /api/start` to receive configuration JSON, and `GET /api/tick` to advance the system clock.
2. **React + TypeScript Frontend:** Provides a stunning visual interface using Tailwind CSS.

**UI Features Include:**
* **Real-time Configuration:** Adjust the number of servers, queue sizes, customer arrival rates, and simulation speed constraints on the fly without recompiling C++.
* **Live Performance Analytics:** View real-time KPIs including Average Wait Time, Service Rate, Server Utilization, and Queue Lengths.
* **Customer Data Drawer:** A detailed data table showing the exact status, queue wait time, and total time spent for every single generated customer in real-time.

---

## 🚀 6. How to Run

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
