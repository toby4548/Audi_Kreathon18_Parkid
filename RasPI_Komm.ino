#include<ArduinoJson.h>
#include <SPI.h>
#include <MFRC522.h>

#define RST_PIN   8     // SPI Reset Pin
#define SS_PIN    9    // SPI Slave Select Pin

MFRC522 mfrc522(SS_PIN, RST_PIN);   // Instanz des MFRC522 erzeugen

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
int Parkspace1[64] ={};
int Parkspace2;


void setup() {
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

int occupied_value[64] ={};



DynamicJsonBuffer jBuffer;
StaticJsonBuffer<64> jBufferA;
JsonObject& root = jBuffer.createObject();



  //sensor 1
  digitalWrite(trigger, LOW); 
  delay(5); 
   digitalWrite(trigger, HIGH); 
  delay(10);
  digitalWrite(trigger, LOW);
  dauer = pulseIn(echo, HIGH); 
  entfernung = (dauer/2) * 0.03432; 
//sensor 2
  digitalWrite(trigger2, LOW); 
  delay(5); 
  digitalWrite(trigger2, HIGH); 
  delay(10);
  digitalWrite(trigger2, LOW);
  dauer2 = pulseIn(echo2, HIGH); 
  entfernung2 = (dauer2/2) * 0.03432; 


//read RFID
int ID;
if(mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()){
  for (byte i = 0; i < mfrc522.uid.size; i++) {
            //  Serial.print(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
             // Serial.print(mfrc522.uid.uidByte[i], HEX);   

  byte id = mfrc522.uid.uidByte[i];
 // root["CarID"] = Serial(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");


 ///////////////////////OUTPUT CarID not Correct!!!!//////////////////////////
              
  }
  
}else{
  root["CarID"] = 0;
}

//read sensors

JsonArray& occupied = root.createNestedArray("occupied");

   for (int i = 0; i <64; i++) {
     occupied.add(occupied_value[i]);
   }

if(entfernung <=50){
  digitalWrite(led1, HIGH);
  int set_value=1;
  occupied.set(56,set_value);
}else{
  digitalWrite(led1, LOW);

 int set_value = 0;
 occupied.set(56,set_value);
}
if(entfernung2<=50){
  digitalWrite(led2, HIGH);
  int set_value = 1;
  occupied.set(57, set_value);
}else{
  digitalWrite(led2, LOW);
  int set_value = 0;
  occupied.set(57,set_value);
  
}
if(mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()){
  root["CarID"] = "Car1";
}


root.printTo(Serial);
delay(1000);
Serial.println();

}


