#ifndef SERVER_H
#define SERVER_H
#include "Customer.h"
#include "Queue.h"
#include <cmath>

class Server {
private:
  int ServerID;
  bool isBusy;
  Customer currentCustomer;
  int finishTime;
  int totalBusyTime;
  int totalWaitTime;
  int totalCustomerServed;
  Queue customerQueue;
  struct location {
    int x;
    int y;
  } location;

public:
  Server(int id = 0, int x_coord = 0, int y_coord = 0) {
    ServerID = id;
    isBusy = false;
    finishTime = 0;
    totalBusyTime = 0;
    totalCustomerServed = 0;
    totalWaitTime = 0;
    location.x = x_coord;
    location.y = y_coord;
  }

  void addCustomer(Customer c) { customerQueue.enqueue(c); }

  Customer serveNextCustomer() { return customerQueue.dequeue(); }

  bool hasCustomersInQueue() { return !customerQueue.isEmpty(); }

  int getQueueLength() { return customerQueue.getLength(); }

  int getAverageWaitTime() {
    if (totalCustomerServed == 0)
      return 0;
    return totalWaitTime / totalCustomerServed;
  }

  int getLocationX() { return location.x; }
  int getLocationY() { return location.y; }
  int getServerID() { return ServerID; }
  int getFinishTime() { return finishTime; }
  int getTotalBusyTime() { return totalBusyTime; }
  int getTotalCustomerServed() { return totalCustomerServed; }
  bool getIsBusy() { return isBusy; }
  Customer getCurrentCustomer() { return currentCustomer; }

  double distanceTo(Customer &c) {
    return std::sqrt(std::pow(location.x - c.getLocationX(), 2) +
                     std::pow(location.y - c.getLocationY(), 2));
  }

  bool isAvailable() { return !isBusy; }

  void serveCustomer(Customer &c, int currentTime) {
    isBusy = true;
    finishTime = currentTime + c.getTransactionTime();
    c.setWindowOpenTime(currentTime);
    int wait = currentTime - c.getArrivalTime();
    c.setQueueWaitTime(wait);
    c.setServiceEndTime(finishTime);
    currentCustomer = c;
    totalWaitTime += wait;
  }

  bool isDone(int currentTime) { return isBusy && (currentTime >= finishTime); }

  Customer freeServer() {
    isBusy = false;
    totalBusyTime += currentCustomer.getTransactionTime();
    totalCustomerServed++;
    return currentCustomer;
  }

  static int recommendServer(Server servers[], int numServers, Customer &c) {
    int bestServerIdx = -1;
    double bestScore = -1;
    for (int i = 0; i < numServers; i++) {
      double dist = servers[i].distanceTo(c);
      int queueLen = servers[i].getQueueLength();
      bool free = servers[i].isAvailable();
      double score = 0;
      if (free) {
        score = dist;
      } else {
        score = dist + (queueLen * 100.0);
      }

      if (bestScore == -1 || score < bestScore) {
        bestScore = score;
        bestServerIdx = i;
      }
    }
    return bestServerIdx;
  }
};

#endif
