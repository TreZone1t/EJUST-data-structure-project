#include "ServerAPI.cpp"
using namespace std;
int main() {
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
