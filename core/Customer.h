#ifndef CUSTOMER_H
#define CUSTOMER_H
#include "utils/utils.h"

class Customer {
private:
  static int ticketCounter;
  int ticketNumber;
  int arrivalTime;
  int transactionTime;
  int queueWaitTime;
  int serviceEndTime;
  int windowOpenTime;
  struct location {
    int x;
    int y;
  } location;
  int serverId;

public:
  Customer() {
    Utils util;
    ticketNumber = ticketCounter++;
    arrivalTime = util.random(0, 100);
    transactionTime = util.random(1, 10);
    queueWaitTime = 0;
    windowOpenTime = 0;
    serviceEndTime = 0;
    location.x = util.random(0, 1000);
    location.y = util.random(0, 1000);
    serverId = -1;
  }
  Customer(int ticket, int arr, int trans, int x_coord, int y_coord) {
    ticketNumber = ticket;
    arrivalTime = arr;
    transactionTime = trans;
    queueWaitTime = 0;
    windowOpenTime = 0;
    serviceEndTime = 0;
    location.x = x_coord;
    location.y = y_coord;
    serverId = -1;
  }

  int getTicketNumber() { return ticketNumber; }
  int getArrivalTime() { return arrivalTime; }
  int getTransactionTime() { return transactionTime; }
  int getQueueWaitTime() { return queueWaitTime; }
  int getServiceEndTime() { return serviceEndTime; }
  int getWindowOpenTime() { return windowOpenTime; }
  int getLocationX() { return location.x; }
  int getLocationY() { return location.y; }
  int getServerId() { return serverId; }

  void setQueueWaitTime(int t) { queueWaitTime = t; }
  void setServiceEndTime(int t) { serviceEndTime = t; }
  void setWindowOpenTime(int t) { windowOpenTime = t; }
  void setServerId(int id) { serverId = id; }

  int getTotalTime() { return serviceEndTime - arrivalTime; }
};
#endif
