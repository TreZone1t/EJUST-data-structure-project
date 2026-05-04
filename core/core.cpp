#include <iostream>
#include "lib/httplib.h"
#include "Customer.h"
#include "Server.h"
#include "Queue.h"

using namespace std;
using namespace httplib;

int main()
{ 
    Server svr;
    const int port = 8080;
    svr.Get("/", [](const httplib::Request &, httplib::Response &res)
            { res.set_content("Hello from C++ Windows Server!", "text/plain"); });
    cout << "Server started at port:" << port;
                 svr.listen("0.0.0.0", port);
    return 0;
}