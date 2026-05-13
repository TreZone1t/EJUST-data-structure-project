#include "Customer.h"
#include "Queue.h"
#include "Server.h"
#include "lib/httplib.h"
#include <cmath>
#include <string>
using namespace std;
int Device::counter = 0;
class ServerAPI {
private:
  int Squeue;
  int tick;
  int ticksPerCall; // how many simulation steps per API request
  int arrivalRate;  // new customers per tick
  int totalSpawned; // how many customers have been created so far
  bool sim_running;
  Queue<Server> servers;
  Queue<Customer> customers;
  Queue<Customer> customers_being_served;
  Queue<Customer> completed_customers; // all served customers for report
  int max_customers;
  const int port = 8081;
  httplib::Server http_server;

  string generateJsonData() {
    string json = "{";
    json += "\"time\":" + to_string(tick) + ",";
    json += "\"isRunning\":" + string(sim_running ? "true" : "false") + ",";
    // isFinished: global queue empty + all server queues empty + no server busy
    // + sim has run
    bool allServerQueuesEmpty = true;
    bool anyServerBusy = false;
    for (int i = 0; i < servers.getLength(); i++) {
      if (servers[i].getQueueLength() > 0)
        allServerQueuesEmpty = false;
      if (servers[i].isBusy())
        anyServerBusy = true;
    }
    bool isFinished = sim_running && tick > 0 && customers.getLength() == 0 &&
                      allServerQueuesEmpty && !anyServerBusy;
    if (isFinished)
      sim_running = false;
    json += "\"isFinished\":" + string(isFinished ? "true" : "false") + ",";
    json += "\"servers\":[";
    for (int i = 0; i < servers.getLength(); i++) {
      if (i > 0)
        json += ",";
      Server s = servers[i];
      json += "{\"id\":" + to_string(s.getDeviceId()) +
              ",\"x\":" + to_string(s.getX()) +
              ",\"y\":" + to_string(s.getY()) +
              ",\"queueLength\":" + to_string(s.getQueueLength()) +
              ",\"isBusy\":" + string(s.isBusy() ? "true" : "false") +
              ",\"totalServed\":" + to_string(s.getTotalCustomerServed()) +
              ",\"totalBusyTime\":" + to_string(s.getTotalBusyTime()) +
              ",\"avgWaitTime\":" + to_string(s.getAverageWaitTime()) + "}";
    }
    json += "],\"customers\":[";
    bool firstCustomer = true;
    // Active customers in server queues
    for (int i = 0; i < servers.getLength(); i++) {
      Queue<Customer> sq = servers[i].getQueue();
      for (int j = 0; j < sq.getLength(); j++) {
        Customer c = sq[j];
        if (!firstCustomer)
          json += ",";
        firstCustomer = false;
        json += "{\"id\":" + to_string(c.getDeviceId()) +
                ",\"x\":" + to_string(c.getX()) +
                ",\"y\":" + to_string(c.getY()) +
                ",\"arrivalTime\":" + to_string(c.getArrivalTime()) +
                ",\"transactionTime\":" + to_string(c.getTransactionTime()) +
                ",\"queueWaitTime\":" + to_string(c.getQueueWaitTime()) +
                ",\"windowOpenTime\":" + to_string(c.getWindowOpenTime()) +
                ",\"serviceEndTime\":" + to_string(c.getServiceEndTime()) +
                ",\"serverId\":" + to_string(c.getServerId()) + "}";
      }
    }
    json += "],\"completedCustomers\":[";
    for (int i = 0; i < completed_customers.getLength(); i++) {
      Customer c = completed_customers[i];
      if (i > 0)
        json += ",";
      json += "{\"id\":" + to_string(c.getDeviceId()) +
              ",\"arrivalTime\":" + to_string(c.getArrivalTime()) +
              ",\"transactionTime\":" + to_string(c.getTransactionTime()) +
              ",\"queueWaitTime\":" + to_string(c.getQueueWaitTime()) +
              ",\"windowOpenTime\":" + to_string(c.getWindowOpenTime()) +
              ",\"serviceEndTime\":" + to_string(c.getServiceEndTime()) +
              ",\"serverId\":" + to_string(c.getServerId()) + "}";
    }
    json += "]}";
    return json;
  }

  void simulationTick() {
    if (!sim_running)
      return;
    // Spawn arrivalRate new customers per tick (until max_customers reached)
    int toSpawn = 0;
    if (totalSpawned < max_customers) {
      toSpawn = arrivalRate;
      if (totalSpawned + toSpawn > max_customers)
        toSpawn = max_customers - totalSpawned;
    }
    for (int k = 0; k < toSpawn; k++) {
      Customer c(tick); // arrivalTime = current tick
      customers.enqueue(c);
      totalSpawned++;
    }
    for (int i = 0; i < servers.getLength(); i++) {
      // 1. Free server if finished → save to completed_customers
      if (servers[i].isBusy() && servers[i].isDone(tick)) {
        Customer done = servers[i].freeServer();
        completed_customers.enqueue(done);
        customers_being_served.dequeue();
      }

      // 2. Fill queue slots from the global waiting pool
      while (customers.getLength() > 0 && servers[i].hasQueueSpace()) {
        Customer c = customers.dequeue();
        c.setServerId(servers[i].getDeviceId());

        // Place customer in a circle around the server (radius 200)
        // Use current queue length for angle BEFORE adding (so positions spread
        // out)
        double angle =
            (servers[i].getQueueLength() * 45) * (3.14159265358979 / 180.0);
        int radius = 200;
        c.setLocation(servers[i].getX() + (int)(cos(angle) * radius),
                      servers[i].getY() + (int)(sin(angle) * radius));

        servers[i].addCustomer(c);
        customers_being_served.enqueue(c); // enqueue AFTER location is set
      }

      // 3. Start serving if idle and queue has customers
      if (!servers[i].isBusy() && servers[i].getQueueLength() > 0) {
        Customer next = servers[i].serveNextCustomer();
        servers[i].serveCustomer(next, tick);
      }
    }

    tick++;
  }

public:
  ServerAPI(int servers_count)
      : Squeue(3), tick(0), ticksPerCall(3), arrivalRate(2), totalSpawned(0),
        sim_running(false), max_customers(100) {
    for (int i = 0; i < servers_count; i++) {
      Server s(Squeue);
      s.setLocation(i * 1000, 0);
      servers.enqueue(s);
    }
  }
  void run() {
    // GET /api/tick - advance simulation one step
    http_server.Get("/api/tick",
                    [this](const httplib::Request &, httplib::Response &res) {
                      if (sim_running)
                        this->simulationTick();
                      res.set_header("Access-Control-Allow-Origin", "*");
                      res.set_content("{\"ok\":true}", "application/json");
                    });

    // GET /api/data - advance simulation ticksPerCall steps then return state
    http_server.Get("/api/data",
                    [this](const httplib::Request &, httplib::Response &res) {
                      for (int t = 0; t < ticksPerCall && sim_running; t++)
                        this->simulationTick();
                      string data = this->generateJsonData();
                      res.set_header("Access-Control-Allow-Origin", "*");
                      res.set_content(data, "application/json");
                    });

    http_server.Get("/api/stop", [this](const httplib::Request &req,
                                        httplib::Response &res) {
      this->sim_running = false;
      this->tick = 0;
      res.set_header("Access-Control-Allow-Origin", "*");
      res.set_content("{\"status\": \"stopped\"}", "application/json");
    });

    http_server.Get("/api/start", [this](const httplib::Request &req,
                                         httplib::Response &res) {
      int reqServers = 3;
      if (req.has_param("servers")) {
        reqServers = std::stoi(req.get_param_value("servers"));
      }
      int reqQueueLength = 3;
      if (req.has_param("Squeue")) {
        reqQueueLength = std::stoi(req.get_param_value("Squeue"));
      }
      this->Squeue = reqQueueLength;
      this->max_customers = 100;
      if (req.has_param("customers")) {
        this->max_customers = std::stoi(req.get_param_value("customers"));
      }
      // Arrival rate: how many customers arrive per tick
      this->arrivalRate = 2;
      if (req.has_param("arrivalRate")) {
        int ar = std::stoi(req.get_param_value("arrivalRate"));
        this->arrivalRate = (ar > 0 && ar <= 50) ? ar : 2;
      }
      // Speed: how many ticks to advance per /api/data call
      this->ticksPerCall = 3;
      if (req.has_param("speed")) {
        int s = std::stoi(req.get_param_value("speed"));
        this->ticksPerCall = (s > 0 && s <= 20) ? s : 3;
      }

      this->tick = 0;
      this->totalSpawned = 0;
      Device::resetCounter();
      // Clear all queues
      while (this->servers.getLength() > 0)
        this->servers.dequeue();
      while (this->customers.getLength() > 0)
        this->customers.dequeue();
      while (this->customers_being_served.getLength() > 0)
        this->customers_being_served.dequeue();
      while (this->completed_customers.getLength() > 0)
        this->completed_customers.dequeue();

      for (int i = 0; i < reqServers; i++) {
        Server s(Squeue);
        this->servers.enqueue(s);
      }
      this->sim_running = true;

      res.set_header("Access-Control-Allow-Origin", "*");
      res.set_content("{\"status\": \"started\"}", "application/json");
    });

    cout << "HTTP Server starting at http://0.0.0.0:" << port << endl;
    if (!http_server.listen("0.0.0.0", port)) {
      cerr << "Error: Could not start HTTP server on port " << port
           << ". Maybe the port is already in use?" << endl;
    }
    cout << "Server has stopped." << endl;
  }
};