#include <iostream>
#include "lib/httplib.h"
#include "Customer.h"
#include "Server.h"
#include "Queue.h"

using namespace std;
using namespace httplib;
int free_server(vector<int>& serverEndTime) {
    int idx = 0;
    int earliest = serverEndTime[0];

    for (int i = 1; i < serverEndTime.size(); i++) {
        if (serverEndTime[i] < earliest) {
            earliest = serverEndTime[i];
            idx = i;
        }
    }
    return idx;
}
void runSimulation(int Customers, int Servers) {
    srand(time(0));
    vector<int> arrival(Customers);
    vector<int> service(Customers);
    vector<int> serverEndTime(Servers, 0);
    // Generate arrival times (inter-arrival)
    arrival[0] = 0;
    for (int i = 1; i < Customers; i++) {
        arrival[i] = arrival[i - 1] + (rand() % 10 + 1);
    }
    // Generate service times
    for (int i = 0; i < Customers; i++) {
        service[i] = rand() % 5 + 1;
    }
    cout << "-------------------------------------------------------------------\n";
    cout << "Arr\t \tWait\t \tStart\t \tServ\t \tEnd\t \tIdle\t Server\n";
    cout << "--------------------------------------------------------------------\n";
    for (int i = 0; i < Customers; i++) {
        int server = free_server(serverEndTime);
        int start = max(arrival[i], serverEndTime[server]);
        int wait = start - arrival[i];
        int idle = max(0, arrival[i] - serverEndTime[server]);
        int end = start + service[i];
        serverEndTime[server] = end;
        cout << arrival[i] << "\t"<<"\t"
             << wait << "\t"<<"\t"<<"\t"
             << start << "\t" <<"\t" <<"\t"
             << service[i] << "\t" <<"\t"<<"\t"
             << end << "\t" <<"\t"<<"\t"
             << idle<<"\t"<<"\t"
             << server << endl;
    }
}

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
