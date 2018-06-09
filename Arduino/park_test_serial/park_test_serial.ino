#include <SPI.h>
#include <MFRC522.h>
#include <ArduinoJson.h>

#define RST_PIN   9     // SPI Reset Pin
#define SS_PIN    10    // SPI Slave Select Pin

int trigger = 7;
int echo = 6;
long dauer = 0;
long entfernung = 0;
String P = "Parkplatz 1"; //Name Ultraschallsensor

MFRC522 mfrc522(SS_PIN, RST_PIN);   // Instanz des MFRC522 erzeugen

void setup() {
  // Diese Funktion wird einmalig beim Start ausgeführt
  Serial.begin(9600);  // Serielle Kommunikation mit dem PC initialisieren
  SPI.begin();         // Initialisiere SPI Kommunikation
  mfrc522.PCD_Init();  // Initialisiere MFRC522 Lesemodul
  pinMode(trigger, OUTPUT);
  pinMode(echo, INPUT);


}

void loop() {

  digitalWrite(trigger, LOW);
  delay(5);
  digitalWrite(trigger, HIGH);
  delay(10);
  digitalWrite(trigger, LOW);
  dauer = pulseIn(echo, HIGH);
  entfernung = (dauer / 2) * 0.03432;

  DynamicJsonBuffer jsonBuffer; //----- PROBLEM LINE -----//
  JsonObject& root = jsonBuffer.createObject();

  int carID = 1;
  int occupied = 0;

  if (entfernung <= 100) {
    occupied = 1;
    root["carID"] = carID;
    root["occupied"] = occupied;
    root.printTo(Serial);
    Serial.println();
  } else {
    occupied = 0;
    root["carID"] = carID;
    root["occupied"] = occupied;
    root.printTo(Serial);
    Serial.println();
  }

  // Versetzt die gelesene Karte in einen Ruhemodus, um nach anderen Karten suchen zu können.
  // mfrc522.PICC_HaltA();
  delay(1000);
}
