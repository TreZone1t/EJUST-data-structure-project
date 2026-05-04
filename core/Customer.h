#ifndef CUSTOMER_H
#define CUSTOMER_H
class Customer {
private:
    int ticketNumber;
    int arrivalTime;
    int transactionTime;
    int queueWaitTime;
    int serviceEndTime;
    int windowOpenTime;
public:
    Customer(int ticket, int arrival, int transaction) {
        ticketNumber = ticket;
        arrivalTime = arrival;
        transactionTime = transaction;
        queueWaitTime = 0;
        serviceEndTime = 0;
        windowOpenTime = 0;
    }
    Customer() {
        ticketNumber = arrivalTime = transactionTime = 0;
        queueWaitTime = serviceEndTime = windowOpenTime = 0;
    }

    int getTicketNumber()    { return ticketNumber; }
    int getArrivalTime()     { return arrivalTime; }
    int getTransactionTime() { return transactionTime; }
    int getQueueWaitTime()   { return queueWaitTime; }
    int getServiceEndTime()  { return serviceEndTime; }
    int getWindowOpenTime()  { return windowOpenTime; }

    void setQueueWaitTime(int t)  { queueWaitTime = t; }
    void setServiceEndTime(int t) { serviceEndTime = t; }
    void setWindowOpenTime(int t) { windowOpenTime = t; }

    int getTotalTime() {
        return serviceEndTime - arrivalTime;
    }
};
#endif
