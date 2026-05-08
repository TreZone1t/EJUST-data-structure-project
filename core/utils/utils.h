#include <cstdlib>
class Utils{
    public:
int  random(int min, int max){
     return (rand() % (max - min + 1) + min) ;
}

};

