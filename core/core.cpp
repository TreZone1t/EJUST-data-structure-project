#include <iostream>
#include "lib/httplib.h"
#include "Customer.h"
#include "Server.h"
#include "Queue.h"

using namespace std;
using namespace httplib;
int FreeServer(vector<ServerO>& servers, int currentTime) {
    for (int i = 0; i < servers.size(); i++) {
        if (servers[i].time <= currentTime) {
            return i;
        }
    }
    return -1; // no free server
}


   
int main()
{ 
    Server svr;
    const int port = 8080;
    svr.Get("/", [](const httplib::Request &, httplib::Response &res)
            { res.set_content("Hello from C++ Windows Server!", "text/plain"); });
    cout << "Server started at port:" << port;
                 svr.listen("0.0.0.0", port);

    srand(time(0));

    int numCustomers = 10;
    int numServers = 2;

    Queue q;
    vector<ServerO> servers(numServers);

    // initialize servers
    for (int i = 0; i < numServers; i++) {
        servers[i].id = i;
        servers[i].time = 0;
        servers[i].isFree = true;
    }

    int arrival = 0;

    cout << "Arr\tWait\tStart\tServ\tEnd\tServer\n";
    cout << "-------------------------------------------------\n";

    for (int i = 0; i < numCustomers; i++) {

        // generate times
        if (i != 0)
            arrival += (rand() % 10 + 1);

        int service = rand() % 5 + 1;

        Customer c(i, arrival, service);

        // add to queue
        q.enqueue(c);

        // try to serve from queue
        int serverIndex = FreeServer(servers, arrival);

        if (serverIndex != -1 && !q.isEmpty()) {

            Customer current = q.dequeue();

            int start = max(current.getArrivalTime(), servers[serverIndex].time);
            int wait = start - current.getArrivalTime();
            int end = start + current.getTransactionTime();

            current.setQueueWaitTime(wait);
            current.setWindowOpenTime(start);
            current.setServiceEndTime(end);

            servers[serverIndex].time = end;

            cout << current.getArrivalTime() << "\t"
                 << wait << "\t"
                 << start << "\t"
                 << current.getTransactionTime() << "\t"
                 << end << "\t"
                 << serverIndex << endl;
        }
    return 0;
}
