#include <SPI.h>
#include <MFRC522.h>
#include <ArduinoJson.h>
 
#define RST_PIN   9     // SPI Reset Pin
#define SS_PIN    10    // SPI Slave Select Pin

int trigger=7;
int echo=6;
long dauer=0;
long entfernung=0;
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
  entfernung = (dauer/2) * 0.03432; 



  /*
  if (entfernung<= 100 && mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()){
    Serial.print("Fahrzeug: ");
    for (byte i = 0; i < mfrc522.uid.size; i++) {
      //Abstand zwischen HEX-Zahlen und führende Null bei Byte < 16
      Serial.print(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
      Serial.print(mfrc522.uid.uidByte[i], HEX);    
    } 
    Serial.print(" befindet sich auf " + P);
    delay(1000);
   } else {
    if(entfernung<=100 && !mfrc522.PICC_IsNewCardPresent() && !mfrc522.PICC_ReadCardSerial()){
      Serial.print("ERROR!" + P + " prüfen!");
      delay(1000);
    } else {
      if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial() && entfernung>100 ) {
        Serial.print("Fahrzeug :");
        for (byte i = 0; i < mfrc522.uid.size; i++) {
          //Abstand zwischen HEX-Zahlen und führende Null bei Byte < 16
          Serial.print("Fahrzeug: " + mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
          Serial.print(mfrc522.uid.uidByte[i], HEX);
        } 
        Serial.print(" befindet sich in der Halle");
      } else {
        if(entfernung>100 && !mfrc522.PICC_IsNewCardPresent() && !mfrc522.PICC_ReadCardSerial()){
          Serial.print("Parkplatz "+P+" ist frei");
          delay(1000);
        }
      }
    }
  }
  */

  DynamicJsonBuffer jsonBuffer; //----- PROBLEM LINE -----//
  JsonObject& root = jsonBuffer.createObject();


  int carID = 1;
  int besetzt = 0;

  if (entfernung<= 100) {
    besetzt = 1;
    root["carID"] = carID;
    root["besetzt"] = besetzt;
    root.printTo(Serial);
    Serial.println(); 
  } else {
    besetzt = 0;
    root["carID"] = carID;
    root["besetzt"] = besetzt;
    root.printTo(Serial);
    Serial.println(); 
  }


  
  // Versetzt die gelesene Karte in einen Ruhemodus, um nach anderen Karten suchen zu können.
  // mfrc522.PICC_HaltA();
  delay(1000);
}
