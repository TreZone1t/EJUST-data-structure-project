#ifdef _WIN32
#include <winsock2.h>
#endif
#include "ServerAPI.cpp"
#include <cstdlib>
#include <ctime>

using namespace std;

int main() {
  srand(time(0));
#ifdef _WIN32
  WSADATA wsaData;
  if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
    cerr << "WSAStartup failed." << endl;
    return 1;
  }
#endif
  try {
    ServerAPI *api = new ServerAPI(3);
    api->run();
    delete api;
  } catch (const std::exception &e) {
    cerr << "Exception: " << e.what() << endl;
    return 1;
  }
  return 0;
}
