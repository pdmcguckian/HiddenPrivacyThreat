#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

//const char* ssid = "BT-7XCK6F";
//const char* password =  "urgcqY3H3XCPDv";

const char* ssid = "iPhone";
const char* password =  "12345678";
const char* serverName = "https://webhooks.mongodb-realm.com/api/client/v2.0/app/predictor-rjhbq/service/PushBLEData/incoming_webhook/webhook_bdrm?secret=SIoT";

StaticJsonDocument<500> doc;

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi..");}
  
  Serial.println("Connected to the WiFi network");


}

void loop() {
    //Check WiFi connection status
    if(WiFi.status()== WL_CONNECTED){
              
      int sensorReadings = -55;
      doc["timeStampID"] = 10000;
      doc["rssiBDRM"] = sensorReadings;
      
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
}
