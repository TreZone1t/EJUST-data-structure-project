#ifndef UTILS_H
#define UTILS_H
#include <iostream>
#include "Customer.h"
#include "Server.h"
#include "Queue.h"
#include <vector>

using namespace std;
class utils{
    int i;
public :
utils(){
i = 0;
}
 int FreeServer(vector<ServerO>& servers, int currentTime) {
    for (int i = 0; i < servers.size(); i++) {
        if (servers[i].time <= currentTime) {
            return i;
        }
    }
    return -1; 
}

int uniqueID(){
return ++i + rand();
}

};

#endif