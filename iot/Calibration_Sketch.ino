/*
 * AgroSmartHill - Sensor Calibration Sketch
 * Use this to calibrate your soil moisture sensor
 */

#define SOIL_MOISTURE_PIN 34

void setup() {
  Serial.begin(115200);
  Serial.println("\n=================================");
  Serial.println("Soil Moisture Sensor Calibration");
  Serial.println("=================================\n");
  Serial.println("Instructions:");
  Serial.println("1. Insert sensor in DRY soil");
  Serial.println("2. Note the 'Dry Value'");
  Serial.println("3. Insert sensor in WET soil");
  Serial.println("4. Note the 'Wet Value'");
  Serial.println("5. Update these values in main code\n");
}

void loop() {
  int rawValue = analogRead(SOIL_MOISTURE_PIN);
  
  Serial.print("Raw Sensor Value: ");
  Serial.print(rawValue);
  Serial.print(" | ");
  
  // Show what percentage this would be with example calibration
  float exampleMoisture = map(rawValue, 3000, 1000, 0, 100);
  exampleMoisture = constrain(exampleMoisture, 0, 100);
  
  Serial.print("Example Moisture: ");
  Serial.print(exampleMoisture, 1);
  Serial.println("%");
  
  delay(1000);
}
