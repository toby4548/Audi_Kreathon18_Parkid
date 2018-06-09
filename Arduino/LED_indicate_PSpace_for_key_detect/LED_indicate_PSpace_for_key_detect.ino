 
#include <SPI.h>
#include <MFRC522.h>
 
#define RST_PIN   8     // SPI Reset Pin
#define SS_PIN    9    // SPI Slave Select Pin
String P = "Parkplatz 1"; //Name Ultraschallsensor 1
String P2 = "Parkplatz 2";
int trigger=7; 
int echo=6; 
int echo2=40;
int trigger2=44;
long entfernung2=0;
long dauer2=0;
long dauer=0; 
long entfernung=0; 
int led2=22;
int led1=31;
MFRC522 mfrc522(SS_PIN, RST_PIN);   // Instanz des MFRC522 erzeugen
 
void setup() {
  // Diese Funktion wird einmalig beim Start ausgeführt
  Serial.begin(9600);  // Serielle Kommunikation mit dem PC initialisieren
  SPI.begin();         // Initialisiere SPI Kommunikation
  mfrc522.PCD_Init();  // Initialisiere MFRC522 Lesemodul
  pinMode(trigger, OUTPUT); 
  pinMode(echo, INPUT);
  pinMode(trigger2, OUTPUT);
  pinMode(echo2, INPUT);
  pinMode(led2, OUTPUT);
  pinMode(led1, OUTPUT); 
}
 
void loop() {

  digitalWrite(trigger, LOW); 
  delay(5); 
   digitalWrite(trigger, HIGH); 
  delay(10);
  digitalWrite(trigger, LOW);
  dauer = pulseIn(echo, HIGH); 
  entfernung = (dauer/2) * 0.03432; 

   if (entfernung<= 50 && mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()){
         Serial.print("Fahrzeug: ");
         for (byte i = 0; i < mfrc522.uid.size; i++) {
    //Abstand zwischen HEX-Zahlen und führende Null bei Byte < 16
    Serial.print(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
    Serial.print(mfrc522.uid.uidByte[i], HEX);
    
          
  } Serial.print(" befindet sich auf " + P);
  digitalWrite(led1, LOW);
      delay(100);
    } else
    {
      if(entfernung<=50 && !mfrc522.PICC_IsNewCardPresent())
      {
        Serial.print("ERROR!" + P + " prüfen!");
        delay(100);
      }
      else
      {
         if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial() && entfernung>50 ) {
          Serial.print("Fahrzeug :");
          for (byte i = 0; i < mfrc522.uid.size; i++) {
          //Abstand zwischen HEX-Zahlen und führende Null bei Byte < 16
           Serial.print("Fahrzeug: " + mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
           Serial.print(mfrc522.uid.uidByte[i], HEX);
          
  } Serial.print(" befindet sich in der Halle");
    digitalWrite(led1, HIGH);
//    wait();
         } else
  {
    if(entfernung>50 && !mfrc522.PICC_IsNewCardPresent())
    {
      Serial.print("Parkplatz "+P+" ist frei");
      delay(100);
      digitalWrite(led1, LOW);
    }
  }
      }
    }
 
    Serial.println("   "); 
 
    // Versetzt die gelesene Karte in einen Ruhemodus, um nach anderen Karten suchen zu können.
 //  mfrc522.PICC_HaltA();
    delay(50);
  }

