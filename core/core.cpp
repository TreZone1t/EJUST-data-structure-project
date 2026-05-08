#include "Customer.h"
#include "Server.h"
#include "lib/httplib.h"
#include <iostream>
#include <string>

using namespace std;

int Customer::ticketCounter = 0;
int sim_time = 0;
Server global_servers[10];
int num_servers_count = 0;

Customer global_customers[200];
int num_customers_count = 0;

bool sim_running = false;
int spawn_rate = 100;
int max_customers = -1;
int spawned_customers = 0;

void addCustomerToHistory(Customer c) {
  if (num_customers_count < 200) {
    global_customers[num_customers_count++] = c;
  } else {
    // Shift left
    for (int i = 0; i < 199; i++) {
      global_customers[i] = global_customers[i + 1];
    }
    global_customers[199] = c;
  }
}

string generateJsonData() {
  string json = "{";
  json += "\"time\":" + to_string(sim_time) + ",";
  json += "\"isRunning\":" + string(sim_running ? "true" : "false") + ",";
  json += "\"servers\":[";
  for (int i = 0; i < num_servers_count; i++) {
    if (i > 0)
      json += ",";
    json +=
        "{\"id\":" + to_string(global_servers[i].getServerID()) +
        ",\"queueLength\":" + to_string(global_servers[i].getQueueLength()) +
        ",\"isBusy\":" +
        string(global_servers[i].getIsBusy() ? "true" : "false") +
        ",\"totalServed\":" +
        to_string(global_servers[i].getTotalCustomerServed()) +
        ",\"totalBusyTime\":" +
        to_string(global_servers[i].getTotalBusyTime()) + ",\"avgWaitTime\":" +
        to_string(global_servers[i].getAverageWaitTime()) + "}";
  }
  json += "],\"customers\":[";
  bool first = true;
  for (int i = 0; i < num_customers_count; i++) {
    Customer &c = global_customers[i];
    if (!first)
      json += ",";
    json += "{" + string("\"ticketNumber\":") + to_string(c.getTicketNumber()) +
            "," + "\"arrivalTime\":" + to_string(c.getArrivalTime()) + "," +
            "\"transactionTime\":" + to_string(c.getTransactionTime()) + "," +
            "\"queueWaitTime\":" + to_string(c.getQueueWaitTime()) + "," +
            "\"windowOpenTime\":" + to_string(c.getWindowOpenTime()) + "," +
            "\"serviceEndTime\":" + to_string(c.getServiceEndTime()) + "," +
            "\"serverId\":" + to_string(c.getServerId()) + "}";
    first = false;
  }
  json += "]}";
  return json;
}

void advanceSimulation() {
  if (!sim_running)
    return;

  sim_time++;
  for (int i = 0; i < num_servers_count; i++) {
    Server &s = global_servers[i];
    if (s.getIsBusy() && s.isDone(sim_time)) {
      Customer finishedCust = s.freeServer();
      for (int j = 0; j < num_customers_count; j++) {
        if (global_customers[j].getTicketNumber() ==
            finishedCust.getTicketNumber()) {
          global_customers[j] = finishedCust;
          break;
        }
      }
    }
    if (s.isAvailable() && s.hasCustomersInQueue()) {
      Customer current = s.serveNextCustomer();
      s.serveCustomer(current, sim_time);
      for (int j = 0; j < num_customers_count; j++) {
        if (global_customers[j].getTicketNumber() ==
            current.getTicketNumber()) {
          global_customers[j] = s.getCurrentCustomer();
          break;
        }
      }
    }
  }
  if ((max_customers == -1 || spawned_customers < max_customers) &&
      (rand() % 100 < spawn_rate)) {
    Customer c;
    c = Customer(c.getTicketNumber(), sim_time, c.getTransactionTime(),
                 c.getLocationX(), c.getLocationY());
    int bestIdx = Server::recommendServer(global_servers, num_servers_count, c);
    if (bestIdx != -1) {
      c.setServerId(bestIdx);
      global_servers[bestIdx].addCustomer(c);
      addCustomerToHistory(c);
      spawned_customers++;
    }
  }
}

int main() {
  srand(time(0));

  httplib::Server http_svr;
  const int port = 8080;

  http_svr.set_mount_point("/", "../frontend/dist");
  http_svr.Get("/api/data",
               [](const httplib::Request &, httplib::Response &res) {
                 advanceSimulation();
                 string data = generateJsonData();
                 res.set_header("Access-Control-Allow-Origin", "*");
                 res.set_content(data, "application/json");
               });

  http_svr.Get(
      "/api/stop", [](const httplib::Request &req, httplib::Response &res) {
        sim_running = false;
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_content("{\"status\": \"stopped\"}", "application/json");
      });

  http_svr.Get(
      "/api/start", [](const httplib::Request &req, httplib::Response &res) {
        int reqServers = 3;
        if (req.has_param("servers")) {
          reqServers = std::stoi(req.get_param_value("servers"));
        }
        if (reqServers > 10)
          reqServers = 10;

        max_customers = -1;
        if (req.has_param("customers")) {
          max_customers = std::stoi(req.get_param_value("customers"));
        }

        sim_time = 0;
        spawned_customers = 0;
        num_servers_count = reqServers;
        num_customers_count = 0;

        for (int i = 0; i < num_servers_count; i++) {
          global_servers[i] = Server(i, rand() % 1000, rand() % 1000);
        }
        sim_running = true;

        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_content("{\"status\": \"started\"}", "application/json");
      });

  cout << "HTTP Server started at http://localhost:" << port << endl;
  http_svr.listen("0.0.0.0", port);

  return 0;
}
