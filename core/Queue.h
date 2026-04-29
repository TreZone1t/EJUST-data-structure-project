#ifndef QUEUE_H
#define QUEUE_H
#include "Customer.h"
class Queue {
private:
   int len; //this for know how many customer in the queue in the future (like counter or count)
public:
    void enqueue(Customer c);
    Customer dequeue();
    bool isEmpty();
    int getLength();
};

#endif