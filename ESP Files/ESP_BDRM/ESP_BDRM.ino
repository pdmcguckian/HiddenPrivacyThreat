#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>

String beaconAddresses = "c8:48:9c:26:a3:f4";
int scanTime = 5; //In seconds
bool beaconDetected = false;
int becaonRSSI;
BLEScan* pBLEScan;

//const char* ssid = "BT-7XCK6F";
//const char* password =  "urgcqY3H3XCPDv";
const char* ssid = "iPhone";
const char* password =  "12345678";
const char* serverName = "https://webhooks.mongodb-realm.com/api/client/v2.0/app/predictor-rjhbq/service/PushBLEData/incoming_webhook/webhook_bdrm?secret=SIoT";

StaticJsonDocument<500> doc;

void setup() {
  Serial.begin(115200); //Enable UART on ESP32
  
  Serial.println("Scanning..."); // Print Scanning
  pinMode(2, OUTPUT); //make BUILTIN_LED pin as output
  BLEDevice::init("");
  pBLEScan = BLEDevice::getScan(); //create new scan
  pBLEScan->setActiveScan(true); //active scan uses more power, but get results faster
  pBLEScan->setInterval(100); // set Scan interval
  pBLEScan->setWindow(99);  // less or equal setInterval value

  BLEScanResults foundDevices = pBLEScan->start(scanTime, false);

  for (int i = 0; i < foundDevices.getCount(); i++) {
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
  pBLEScan->clearResults();   // delete results fromBLEScan buffer to release memory
  BLEDevice::deinit(true);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi..");}
  Serial.println("Connected to the WiFi network");
  
  if(WiFi.status()== WL_CONNECTED){
             
      doc["timeStampID"] = 10000;

      if (beaconDetected) {
        doc["rssiBDRM"] = becaonRSSI;}
      else {
        doc["rssiBDRM"] = -100;}
      
      HTTPClient http;

      http.begin(serverName);
      http.addHeader("Content-Type", "application/json");

      String json;
      serializeJson(doc, json);

      Serial.println(json);
      
      int httpResponseCode = http.POST(json);
      Serial.println(httpResponseCode);

      delay(5000);
    }
    else {
      Serial.println("WiFi Disconnected");
    }
 
  beaconDetected = false;
  WiFi.mode(WIFI_OFF);
  
}
void loop() {
  // put your main code here, to run repeatedly:
};
