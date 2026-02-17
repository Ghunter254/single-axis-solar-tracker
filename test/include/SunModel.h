// Ghost

#pragma once

class SunModel {

    private:
        double sunAngle;

    public:
        SunModel();
        double getSunAngle(double ldrEast, double ldrWest);
};

