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
  dauer1 = pulseIn(echo2, HIGH);
  entfernung2 = (dauer2 / 2) * 0.03432;

  DynamicJsonBuffer jsonBuffer; //----- PROBLEM LINE -----//
  JsonObject& root = jsonBuffer.createObject();

  int carID = 1;
  int occupied = 0;

  if (entfernung1 <= 100) {
    occupied = 1;
    root["carID"] = carID;
    root["occupied"] = occupied;
    root.printTo(Serial);
    //root.prettyPrintTo(Serial);
    Serial.println();
  } else {
    occupied = 0;
    root["carID"] = carID;
    root["occupied"] = occupied;
    root.printTo(Serial);
    //root.prettyPrintTo(Serial);
    Serial.println();
  }

  // Versetzt die gelesene Karte in einen Ruhemodus, um nach anderen Karten suchen zu können.
  // mfrc522.PICC_HaltA();
  delay(1000);
}
