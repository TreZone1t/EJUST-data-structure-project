#ifndef QUEUE_H
#define QUEUE_H
#include "Customer.h"

class Queue {
private:
    struct Node {
        Customer data;
        Node* next;
        Node(const Customer& c) : data(c), next(nullptr) {}
    };
    Node* front;
    Node* rear;
    int QWaitTimeSum;
    int len;
    int averageQWaitTime;
public:
    Queue() {
        front = rear = nullptr;
        len = 0;
    }

    bool isEmpty() {
        return front == nullptr;
    }

    void enqueue(Customer c) {
        Node* newNode = new Node(c);
        newNode->next = nullptr;

        if (isEmpty()) {
            front = rear = newNode;
        } else {
            rear->next = newNode;
            rear = newNode;
        }
        len++;
        QWaitTimeSum += newNode->data.getQueueWaitTime();
        averageQWaitTime = QWaitTimeSum / len;
    }

    Customer dequeue() {
        if (isEmpty()) return Customer();

        Node* temp = front;
        Customer c = temp->data;

        front = front->next;
        if (front == nullptr) rear = nullptr;

        delete temp;
        len--;

        return c;
    }

    int getLength() {
        return len;
    }

    ~Queue() {
        while (!isEmpty()) {
            dequeue();
        }
    }
};

#endif

//Adam Was Here <--
