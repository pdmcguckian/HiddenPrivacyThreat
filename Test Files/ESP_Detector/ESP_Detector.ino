#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>

String beaconAddresses = "c8:48:9c:26:a3:f4";
int scanTime = 5; //In seconds
bool beaconDetected = false;
int becaonRSSI;
BLEScan* pBLEScan;

void setup() {
  Serial.begin(115200); //Enable UART on ESP32
  Serial.println("Scanning..."); // Print Scanning
  pinMode(2, OUTPUT); //make BUILTIN_LED pin as output
  BLEDevice::init("");
  pBLEScan = BLEDevice::getScan(); //create new scan
  pBLEScan->setActiveScan(true); //active scan uses more power, but get results faster
  pBLEScan->setInterval(100); // set Scan interval
  pBLEScan->setWindow(99);  // less or equal setInterval value
}
void loop() {
  // put your main code here, to run repeatedly:
  BLEScanResults foundDevices = pBLEScan->start(scanTime, false);

  for (int i = 0; i < foundDevices.getCount(); i++)
  {
    BLEAdvertisedDevice device = foundDevices.getDevice(i);
    String deviceAddress = device.getAddress().toString().c_str();
    int rssi = device.getRSSI();
    //Serial.print(rssi);
    //Serial.print(" - ");
    //Serial.println(deviceAddress);
    if (deviceAddress == beaconAddresses) {
      beaconDetected = true;
      becaonRSSI = rssi;}
  }
  if (beaconDetected) {
    digitalWrite(2, HIGH);
    Serial.println(becaonRSSI);
  }
  else {
    digitalWrite(2, LOW);
  };
  beaconDetected = false;
  pBLEScan->clearResults();   // delete results fromBLEScan buffer to release memory
}
