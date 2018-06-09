#include <SPI.h>
#include <MFRC522.h>
#include <ArduinoJson.h>

#define RST_PIN   9     // SPI Reset Pin
#define SS_PIN    10    // SPI Slave Select Pin

int trigger1 = 7;
int echo1 = 6;
int trigger2 = 5;
int echo2 = 4;
long dauer1 = 0;
long entfernung1 = 0;
long dauer2 = 0;
long entfernung2 = 0;
String P = "Parkplatz 1"; //Name Ultraschallsensor
bool park_block_state = false;

MFRC522 mfrc522(SS_PIN, RST_PIN);   // Instanz des MFRC522 erzeugen

void setup() {
  // Diese Funktion wird einmalig beim Start ausgeführt
  Serial.begin(9600);  // Serielle Kommunikation mit dem PC initialisieren
  SPI.begin();         // Initialisiere SPI Kommunikation
  mfrc522.PCD_Init();  // Initialisiere MFRC522 Lesemodul
  pinMode(trigger1, OUTPUT);
  pinMode(echo1, INPUT);
  pinMode(trigger2, OUTPUT);
  pinMode(echo2, INPUT);
}

void loop() {

  digitalWrite(trigger1, LOW);
  delay(5);
  digitalWrite(trigger1, HIGH);
  delay(10);
  digitalWrite(trigger1, LOW);
  dauer1 = pulseIn(echo1, HIGH);
  entfernung1 = (dauer1 / 2) * 0.03432;

  digitalWrite(trigger2, LOW);
  delay(5);
  digitalWrite(trigger2, HIGH);
  delay(10);
  digitalWrite(trigger2, LOW);
  dauer2 = pulseIn(echo2, HIGH);
  entfernung2 = (dauer2 / 2) * 0.03432;

  DynamicJsonBuffer jsonBuffer; //----- PROBLEM LINE -----//
  JsonObject& root = jsonBuffer.createObject();

  String carID = "FF FF FF FF";
  int occupied_1 = 0;
  int occupied_2 = 0;

  root["carID"] = carID;
  //root["occupied_1"] = occupied_1;
  //root["occupied_2"] = occupied_2;  

  int occupied_value[64] = {};
  
  JsonArray& occupied = root.createNestedArray("occupied");

  for (int i = 0; i <64; i++) {
    occupied.add(occupied_value[i]);
  }


  /////////////////The correct flow(Demo v4)////////////////////

  root["check"] = 0; 

  root["check_car"] = 0;
  
  root.printTo(Serial);
  //root.prettyPrintTo(Serial);
  Serial.println();

  delay(5000);

  root["check_car"] = 1;
  root["carID"] = "1A 2B 3C 4D";

  root.printTo(Serial);
  //root.prettyPrintTo(Serial);
  Serial.println();

  delay(5000);

  root["check"] = 1;
  
  int set_value = 1; 
  occupied.set(56,set_value);

  

  root.printTo(Serial);
  //root.prettyPrintTo(Serial);
  Serial.println();

  delay(5000);

  root["check_car"] = 0;
  root["check"] = 0;

  root.printTo(Serial);
  //root.prettyPrintTo(Serial);
  Serial.println();

  delay(5000);





  

  /*
  if ((entfernung1 <= 100)&&(entfernung2 <= 100)) {
    occupied_1 = 1;
    occupied_2 = 1;
    root["occupied_1"] = occupied_1;
    root["occupied_2"] = occupied_2;
    root.printTo(Serial);
    //root.prettyPrintTo(Serial);
    Serial.println();
  } 
  else if (entfernung2 <= 100) {
    occupied_2 = 1;
    root["occupied_2"] = occupied_2;
    root.printTo(Serial);
    //root.prettyPrintTo(Serial);
    Serial.println();
  }
  else if (entfernung1 <= 100) {
    occupied_1 = 1;
    root["occupied_1"] = occupied_1;
    root.printTo(Serial);
    //root.prettyPrintTo(Serial);
    Serial.println();  
  }
  else {
    occupied_1 = 0;
    occupied_2 = 0;
    root["occupied_1"] = occupied_1;
    root["occupied_2"] = occupied_2;
    root.printTo(Serial);
    //root.prettyPrintTo(Serial);
    Serial.println();
  }

  */

  // Versetzt die gelesene Karte in einen Ruhemodus, um nach anderen Karten suchen zu können.
  // mfrc522.PICC_HaltA();

}
