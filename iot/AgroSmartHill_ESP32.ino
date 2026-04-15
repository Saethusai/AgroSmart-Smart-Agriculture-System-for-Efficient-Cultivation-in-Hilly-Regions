#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

// ---------------- WIFI ----------------
const char* ssid = "purple";
const char* password = "1234567890";

// ---------------- THINGSPEAK ----------------
String writeAPI = "W2GIA6QFFBRUFPVJ";
String readAPI  = "QJ1XYSVFRCN1HV98";
String channelID = "3296702";

// ---------------- LCD ----------------
LiquidCrystal_I2C lcd(0x27,16,2);

// ---------------- DHT ----------------
#define DHTPIN 4
#define DHTTYPE DHT11
DHT dht(DHTPIN,DHTTYPE);

// ---------------- PINS ----------------
#define SOIL_PIN 34
#define TRIG 19
#define ECHO 18
#define PUMP 15
#define BUZZER 14

// ---------------- GSM ----------------
#define RXD2 16
#define TXD2 17
HardwareSerial gsm(2);

// ---------------- VARIABLES ----------------
int moisture;
float temp;
float hum;
long duration;
int distance;
int command = 0;
int threshold = 40;
int alertFlag = 0;

unsigned long lastUpdate = 0;

// ✅ AUTO RESET VARIABLES
unsigned long alertTime = 0;
unsigned long resetDelay = 300000; // 5 minutes

// =====================================================

void setup()
{
  Serial.begin(115200);
  gsm.begin(9600, SERIAL_8N1, RXD2, TXD2);

  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(PUMP, OUTPUT);
  pinMode(BUZZER, OUTPUT);

  lcd.init();
  lcd.backlight();
  dht.begin();

  lcd.print("Connecting WiFi");
  Serial.println("Connecting WiFi...");

  WiFi.begin(ssid,password);

  while(WiFi.status()!=WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  lcd.clear();
  lcd.print("WiFi Connected");

  Serial.println("\nWiFi Connected ✅");
  delay(1000);
}

// =====================================================

void loop()
{
  // -------- SOIL --------
  int raw = analogRead(SOIL_PIN);
  moisture = map(raw,4095,0,0,100);

  // -------- DHT --------
  temp = dht.readTemperature();
  hum  = dht.readHumidity();

  // -------- ULTRASONIC --------
  digitalWrite(TRIG,LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG,HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG,LOW);

  duration = pulseIn(ECHO,HIGH);
  distance = duration * 0.034 / 2;

  // -------- SERIAL --------
  Serial.println("\n------ SENSOR DATA ------");
  Serial.print("Soil Moisture: "); Serial.print(moisture); Serial.println(" %");
  Serial.print("Temperature: "); Serial.print(temp); Serial.println(" C");
  Serial.print("Humidity: "); Serial.print(hum); Serial.println(" %");
  Serial.print("Water Level: "); Serial.print(distance); Serial.println(" cm");
  Serial.println("-------------------------");

  // -------- LCD --------
  lcd.clear();
  lcd.print("M:"); lcd.print(moisture);
  lcd.print(" T:"); lcd.print((int)temp);
  lcd.print(" H:"); lcd.print((int)hum);

  lcd.setCursor(0,1);
  lcd.print("L:"); lcd.print(distance);

  // -------- THINGSPEAK --------
  if(millis() - lastUpdate > 15000)
  {
    sendThingSpeak();
    readCommand();
    lastUpdate = millis();
  }

  // -------- ALERT CONDITION --------
  if((moisture < 40 || distance < 10) && alertFlag == 0)
  {
    alertFlag = 1;
    alertTime = millis();   // store alert time

    Serial.println("⚠️ ALERT: Soil Dry OR Water Low");

    digitalWrite(BUZZER,HIGH);
    delay(300);
    digitalWrite(BUZZER,LOW);

    sendSMS();
  }

  // -------- AUTO RESET AFTER TIME --------
  if(alertFlag == 1 && millis() - alertTime > resetDelay)
  {
    Serial.println("🔄 Auto Reset Alert");
    alertFlag = 0;
  }

  // -------- IDEAL RESET --------
  if(moisture > 70 && distance <= 5)
  {
    alertFlag = 0;
  }

  delay(1000);
}

// =====================================================
// 📡 THINGSPEAK
// =====================================================
void sendThingSpeak()
{
  if(WiFi.status()==WL_CONNECTED)
  {
    Serial.println("Sending to ThingSpeak...");

    HTTPClient http;

    String url="http://api.thingspeak.com/update?api_key="+writeAPI+
    "&field1="+String(temp)+
    "&field2="+String(hum)+
    "&field3="+String(moisture)+
    "&field4="+String(distance);

    http.begin(url);
    http.GET();
    http.end();
  }
}

void readCommand()
{

HTTPClient http;

String url="http://api.thingspeak.com/channels/"+channelID+"/feeds/last.json?api_key="+readAPI;

http.begin(url);
int httpCode=http.GET();

if(httpCode>0)
{

String payload=http.getString();

int f1=payload.indexOf("field1\":\"");
int f2=payload.indexOf("field2\":\"");

command = payload.substring(f1+9,f1+10).toInt();
threshold = payload.substring(f2+9,f2+11).toInt();

}

http.end();

// PUMP CONTROL



if(command==1)
digitalWrite(PUMP,HIGH);

if(command==2)
digitalWrite(PUMP,LOW);

}

// =====================================================
// 📩 SMS FUNCTION
// =====================================================
void sendSMS()
{
  Serial.println("📩 Sending SMS...");

  gsm.println("AT");
  delay(500);

  gsm.println("AT+CMGF=1");
  delay(500);

  gsm.println("AT+CMGS=\"+919491544680\"");
  delay(500);

  gsm.print("ALERT!\n");

  if(moisture < 40)
  {
    gsm.print("Soil is DRY!\n");
    gsm.print("Moisture: ");
    gsm.print(moisture);
  }

  if(distance >=8)
  {
    gsm.print("\nWater Level LOW!\n");
    gsm.print("Distance: ");
    gsm.print(distance);
  }

  gsm.print("\nTemp: "); gsm.print(temp);
  gsm.print("\nHumidity: "); gsm.print(hum);

  delay(500);
  gsm.write(26);

  Serial.println("SMS Sent ✅");
}