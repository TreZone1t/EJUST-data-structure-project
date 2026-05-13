#ifndef CUSTOMER_H
#define CUSTOMER_H
#include "Decive.h"
class Customer : public Device {
private:
  int arrivalTime;
  int transactionTime;
  int queueWaitTime;
  int serviceEndTime;
  int windowOpenTime;
  int serverId;

public:
  Customer(int arrTime = 0) : Device() {
    arrivalTime = arrTime;
    transactionTime = rand() % 10 + 1;
    queueWaitTime = 0;
    windowOpenTime = 0;
    serviceEndTime = 0;
    serverId = -1;
  }
  Customer(int ID, int arr, int trans, int x_coord, int y_coord)
      : Device(ID, x_coord, y_coord) {
    arrivalTime = arr;
    transactionTime = trans;
    queueWaitTime = 0;
    windowOpenTime = 0;
    serviceEndTime = 0;
    serverId = -1;
  }
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
