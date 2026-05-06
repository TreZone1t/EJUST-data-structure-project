#ifndef SERVER_H
#define SERVER_H
#include "Customer.h"

class Server {
private:
    int ServerID;
    bool isBusy;
    Customer currentCustomer;
    int finishTime;
    int totalBusyTime;
    int totalCustomerServed;
public:
    Server(int id) {
        ServerID = id;
        isBusy = false;
        finishTime = 0;
        totalBusyTime = 0;
        totalCustomerServed = 0;
    }
//Is the server available?
bool isAvailable() { return !isBusy; }

//Start customer service
void serveCustomer(Customer& c , int currentTime) {

        isBusy = true;
        finishTime = currentTime + c.getTransactionTime();

        //Update customer data
        c.setWindowOpenTime(currentTime);
        c.setQueueWaitTime(currentTime - c.getArrivalTime());
        c.setServiceEndTime(finishTime);
        currentCustomer = c;
    }

bool isDone(int currentTime) {
        return isBusy && (currentTime >= finishTime);
    }

Customer freeServer() {
        isBusy = false;
        totalBusyTime += currentCustomer.getTransactionTime();
        totalCustomerServed++;
        return currentCustomer;
    }

int getServerID()             { return ServerID; }
int getFinishTime()           { return finishTime; }
int getTotalBusyTime()        { return totalBusyTime; }
int getTotalCustomerServed() { return totalCustomerServed; }
bool getIsBusy()              { return isBusy; }

};


#endif    
