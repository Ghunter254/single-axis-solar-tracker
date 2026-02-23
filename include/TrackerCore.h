#ifndef TRACKER_CORE_H
#define TRACKER_CORE_H


class TrackerCore {

    public: 
        TrackerCore();

        void startScan(double currentAngle);

        bool updateScan(double currentAngle, int totalLight, int &motorSpeedCommand);

        int getScanResult();

        bool isScanning();

    private:
        bool _isScanning;
        int _scanPhase;
        double _baseAngle;
        
        int _lightBase;
        int _lightRight;
        int _lightLeft;
        
        int _bestDirection;
        
        const double SCAN_OFFSET = 15.0;
        const int SCAN_SPEED = 120;      
        
        
        const double MAX_SAFE_ANGLE = 290.0; 
        const double MIN_SAFE_ANGLE = 10.0;
};
#endif