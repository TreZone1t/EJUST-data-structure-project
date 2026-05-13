#ifndef QUEUE_H
#define QUEUE_H

template <typename T> class Queue {
private:
  struct Node {
    T data;
    Node *next;
    Node(const T &c) : data(c), next(nullptr) {}
  };
  Node *front;
  Node *rear;
  int len;

public:
  Queue() {
    front = rear = nullptr;
    len = 0;
  }

  Queue(const Queue &other) {
    front = rear = nullptr;
    len = 0;
    Node *curr = other.front;
    while (curr) {
      enqueue(curr->data);
      curr = curr->next;
    }
  }
  Queue &operator=(const Queue &other) {
    if (this != &other) {
      while (!isEmpty())
        dequeue();
      Node *curr = other.front;
      while (curr) {
        enqueue(curr->data);
        curr = curr->next;
      }
    }
    return *this;
  }

  bool isEmpty() const { return front == nullptr; }

  void enqueue(T c) {
    Node *newNode = new Node(c);
    if (isEmpty()) {
      front = rear = newNode;
    } else {
      rear->next = newNode;
      rear = newNode;
    }
    len++;
  }

  T dequeue() {
    if (isEmpty())
      return T();

    Node *temp = front;
    T c = temp->data;

    front = front->next;
    if (front == nullptr)
      rear = nullptr;

    delete temp;
    len--;

    return c;
  }

  T &showFront() { return front->data; }

  int getLength() const { return len; }

  T &operator[](int index) {
    Node *curr = front;
    for (int i = 0; i < index && curr; i++) {
      curr = curr->next;
    }
    if (curr)
      return curr->data;
    return front->data;
  }

  ~Queue() {
    while (!isEmpty()) {
      dequeue();
    }
  }
};

#endif