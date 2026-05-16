#include "Customer.h"
#include "Queue.h"
#include "Server.h"
#include "lib/httplib.h"
#include <cmath>
#include <regex>
#include <string>
using namespace std;
int Device::counter = 0;
class ServerAPI {
private:
  int Squeue;
  int tick;
  int ticksPerCall;
  int totalSpawned;
  int arrival_rate;
  bool sim_running;
  int servers_count;
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
    int toSpawn = 0;
    if (totalSpawned < max_customers) {
      toSpawn = arrival_rate;
      if (totalSpawned + toSpawn > max_customers) {
        toSpawn = max_customers - totalSpawned;
      }
    }
    for (int k = 0; k < toSpawn; k++) {
      Customer c(tick); // arrivalTime = current tick
      customers.enqueue(c);
      totalSpawned++;
    }
    // 1. Free server if finished → save to completed_customers
    for (int i = 0; i < servers.getLength(); i++) {
      if (servers[i].isBusy() && servers[i].isDone(tick)) {
        Customer done = servers[i].freeServer();
        completed_customers.enqueue(done);
        customers_being_served.dequeue();
      }
    }
    while (customers.getLength() > 0) {
      int bestSerID = Server::recommendServer(servers, customers[0]);
      if (bestSerID != -1) {
        Customer c = customers.dequeue();
        c.setServerId(servers[bestSerID].getDeviceId());

        double angle = (servers[bestSerID].getQueueLength() * 45) *
                       (3.14159265358979 / 180.0);
        int radius = 200;
        c.setLocation(servers[bestSerID].getX() + (int)(cos(angle) * radius),
                      servers[bestSerID].getY() + (int)(sin(angle) * radius));

        servers[bestSerID].addCustomer(c);
      } else {
        break; // All servers are full
      }
    }

    // 3. Start serving if idle and queue has customers
    for (int i = 0; i < servers.getLength(); i++) {
      if (!servers[i].isBusy() && servers[i].getQueueLength() > 0) {
        Customer next = servers[i].serveNextCustomer();
        servers[i].serveCustomer(next, tick);
      }
    }

    tick++;
  }

public:
  ServerAPI()
      : servers_count(3), Squeue(3), tick(0), ticksPerCall(3), totalSpawned(0),
        arrival_rate(1), sim_running(false), max_customers(100) {
    for (int i = 0; i < servers_count; i++) {
      Server s(Squeue);
      int cx = 1000, cy = 1000;
      double goldenAngle = 2.399963229728653; // in radians
      double radius = 500.0 * sqrt(i + 1);
      double angle = i * goldenAngle;

      int rx = cx + (int)(cos(angle) * radius);
      int ry = cy + (int)(sin(angle) * radius);
      s.setLocation(rx, ry);
      servers.enqueue(s);
    }
  }
  void run() {
    http_server.Get("/api/tick",
                    [this](const httplib::Request &, httplib::Response &res) {
                      if (sim_running)
                        this->simulationTick();
                      res.set_header("Access-Control-Allow-Origin", "*");
                      res.set_content("{\"ok\":true}", "application/json");
                    });

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
    http_server.Options(
        "/api/start", [](const httplib::Request &req, httplib::Response &res) {
          res.set_header("Access-Control-Allow-Origin", "*");
          res.set_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
          res.set_header("Access-Control-Allow-Headers", "Content-Type");
          res.status = 200;
        });

    http_server.Post("/api/start", [this](const httplib::Request &req,
                                          httplib::Response &res) {
      string body = req.body;
      auto getInt = [&](const string &key, int def) {
        regex r("\"" + key + "\"\\s*:\\s*(-?\\d+)");
        smatch match;
        if (regex_search(body, match, r)) {
          return stoi(match[1].str());
        }
        return def;
      };
      auto getString = [&](const string &key, const string &def) {
        regex r("\"" + key + "\"\\s*:\\s*\"([^\"]+)\"");
        smatch match;
        if (regex_search(body, match, r)) {
          return match[1].str();
        }
        return def;
      };

      int reqServers = getInt("servers", 3);
      this->Squeue = getInt("Squeue", 3);
      this->max_customers = getInt("customers", 100);

      int s = getInt("speed", 3);
      this->ticksPerCall = (s > 0 && s <= 20) ? s : 3;

      int ar = getInt("arrivalRate", 1);
      this->arrival_rate = (ar > 0) ? ar : 1;

      string layout = getString("layout", "fibonacci");

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

      int cx = 1000, cy = 1000;
      int spacing = 1000;

      for (int i = 0; i < reqServers; i++) {
        Server s(Squeue);
        int rx = cx, ry = cy;

        if (layout == "random") {
          rx = 800 + rand() % 2000;
          ry = 800 + rand() % 1500;
        } else if (layout == "grid") {
          int cols = (int)ceil(sqrt(reqServers));
          int row = i / cols;
          int col = i % cols;
          rx = cx + col * spacing;
          ry = cy + row * spacing;
        } else if (layout == "line") {
          rx = cx + i * spacing;
          ry = cy;
        } else { // Default: fibonacci
          double goldenAngle = 2.399963229728653;
          double radius = 500.0 * sqrt(i + 1);
          double angle = i * goldenAngle;
          rx = cx + (int)(cos(angle) * radius);
          ry = cy + (int)(sin(angle) * radius);
        }

        s.setLocation(rx, ry);
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