#ifndef DEVICE_H
#define DEVICE_H
#include <cstdlib>
class Device {
protected:
  int deviceId;
  struct Location {
    int x;
    int y;
  } location;
  static int counter;
public:
  Device() {
    deviceId = counter++;
    location.x = rand() % 1000;
    location.y = rand() % 1000;
  }
  Device(int id, int x, int y) : deviceId(id), location({x, y}) {}

  int getDeviceId() const { return deviceId; }
  int getX() const { return location.x; }
  int getY() const { return location.y; }
  void setLocation(int x, int y) {
    location.x = x;
    location.y = y;
  }
  static void resetCounter() { counter = 0; }
};
#endif