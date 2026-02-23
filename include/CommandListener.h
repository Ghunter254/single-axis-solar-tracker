#ifndef COMMANDLISTENER_H
#define COMMANDLISTENER_H

#include <Arduino.h>

struct Command {
    bool run = false;
    bool stop = false;
    // future commands we will add here.
};

class CommandListener {
private:
    static const int BUFFER_SIZE = 128;
    char buffer[BUFFER_SIZE];
    int index;

public:
    CommandListener();

    void begin(unsigned long baudRate);

    void update(Command &cmd);
};

#endif
