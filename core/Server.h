#ifndef SERVER_H
#define SERVER_H
#include "Customer.h"
#include "Decive.h"
#include "Queue.h"
#include <cmath>

class Server : public Device {
private:
  bool isBusyFlag;
  Customer currentCustomer;
  int finishTime;
  int totalBusyTime;
  int totalWaitTime;
  int totalCustomerServed;

public:
  int QueueLength;
  Queue<Customer> customerQueue;

  Server(int l = 0) : Device() {
    finishTime = 0;
    totalBusyTime = 0;
    totalCustomerServed = 0;
    totalWaitTime = 0;
    isBusyFlag = false;
    QueueLength = (l > 0) ? l : 5;
  }

  void addCustomer(Customer c) { customerQueue.enqueue(c); }

  Customer serveNextCustomer() { return customerQueue.dequeue(); }

  bool hasCustomersInQueue() const { return !customerQueue.isEmpty(); }

  int getQueueLength() const { return customerQueue.getLength(); }

  int getAverageWaitTime() const {
    if (totalCustomerServed == 0)
      return 0;
    return totalWaitTime / totalCustomerServed;
  }
  int getFinishTime() const { return finishTime; }
  int getTotalBusyTime() const { return totalBusyTime; }
  int getTotalCustomerServed() const { return totalCustomerServed; }
  bool isBusy() const { return isBusyFlag; }
  bool hasQueueSpace() const { return customerQueue.getLength() < QueueLength; }
  Customer getCurrentCustomer() const { return currentCustomer; }

  void serveCustomer(Customer &c, int currentTime) {
    isBusyFlag = true;
    finishTime = currentTime + c.getTransactionTime();
    c.setWindowOpenTime(currentTime);
    int wait = currentTime - c.getArrivalTime();
    c.setQueueWaitTime(wait);
    c.setServiceEndTime(finishTime);
    currentCustomer = c;
    totalWaitTime += wait;
  }

  bool isDone(int currentTime) const {
    return (isBusy()) && (currentTime >= finishTime);
  }

  Customer freeServer() {
    isBusyFlag = false;
    totalBusyTime += currentCustomer.getTransactionTime();
    totalCustomerServed++;
    return currentCustomer;
  }
  Queue<Customer> getQueue() const { return customerQueue; }
  static int recommendServer(Queue<Server> &servers, Customer &c) {
    int bestServerIdx = -1;
    int minQueue = 999999;
    for (int i = 0; i < servers.getLength(); i++) {
      Server currentServer = servers[i];
      if (!currentServer.hasQueueSpace())
        continue;

      int queueLen = currentServer.getQueueLength();
      if (queueLen < minQueue) {
        minQueue = queueLen;
        bestServerIdx = i;
      }
    }
    return bestServerIdx;
  }
};

#endif
