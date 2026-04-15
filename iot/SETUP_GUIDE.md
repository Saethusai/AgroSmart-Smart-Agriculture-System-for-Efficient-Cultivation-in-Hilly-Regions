# AgroSmartHill ESP32 - Setup Guide

## Required Arduino Libraries

Install these libraries through Arduino IDE Library Manager:

1. **DHT sensor library** by Adafruit
   - Library Manager: Search "DHT sensor library"
   - Version: 1.4.4 or later

2. **Adafruit Unified Sensor** by Adafruit
   - Library Manager: Search "Adafruit Unified Sensor"
   - Required dependency for DHT library

3. **ArduinoJson** by Benoit Blanchon
   - Library Manager: Search "ArduinoJson"
   - Version: 6.21.0 or later

4. **HTTPClient** (Built-in with ESP32)
   - No installation needed

5. **WiFi** (Built-in with ESP32)
   - No installation needed

## Hardware Setup

### Pin Connections

```
ESP32 Pin Connections:
┌─────────────────────────────────────────┐
│ Soil Moisture Sensor                    │
│   VCC → 3.3V                            │
│   GND → GND                             │
│   AOUT → GPIO34                         │
│                                         │
│ DHT22 Sensor                            │
│   VCC → 3.3V                            │
│   GND → GND                             │
│   DATA → GPIO4                          │
│   (Add 10kΩ resistor between VCC & DATA)│
│                                         │
│ HC-SR04 Ultrasonic Sensor               │
│   VCC → 5V                              │
│   GND → GND                             │
│   TRIG → GPIO5                          │
│   ECHO → GPIO18                         │
│                                         │
│ 5V Relay Module                         │
│   VCC → 5V                              │
│   GND → GND                             │
│   IN → GPIO23                           │
│   COM → 12V Power Supply (+)            │
│   NO → Water Pump (+)                   │
│                                         │
│ Water Pump                              │
│   (+) → Relay NO                        │
│   (-) → 12V Power Supply (-)            │
│                                         │
│ Status LED                              │
│   Anode (+) → GPIO2 (via 220Ω resistor)│
│   Cathode (-) → GND                     │
└─────────────────────────────────────────┘
```

## Configuration Steps

### 1. Update WiFi Credentials

Open `AgroSmartHill_ESP32.ino` and update:

```cpp
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
```

### 2. Update Server Configuration

Find your computer's IP address:
- Windows: Open CMD and type `ipconfig`
- Look for "IPv4 Address" (e.g., 192.168.1.100)

Update in code:
```cpp
const char* SERVER_URL = "http://192.168.1.100:5000";
```

### 3. Get Authentication Token

1. Open http://localhost:5173 in browser
2. Login with your farmer account
3. Open Browser Developer Tools (F12)
4. Go to "Application" or "Storage" tab
5. Find "localStorage" → "token"
6. Copy the token value

Update in code:
```cpp
const char* AUTH_TOKEN = "YOUR_JWT_TOKEN_HERE";
```

### 4. Calibrate Soil Moisture Sensor

Run this calibration sketch first:

```cpp
void setup() {
  Serial.begin(115200);
}

void loop() {
  int rawValue = analogRead(34);
  Serial.print("Raw Value: ");
  Serial.println(rawValue);
  delay(1000);
}
```

- Put sensor in **dry soil** → Note the value (e.g., 3000)
- Put sensor in **wet soil** → Note the value (e.g., 1000)

Update in main code:
```cpp
#define SOIL_DRY_VALUE 3000  // Your dry value
#define SOIL_WET_VALUE 1000  // Your wet value
```

### 5. Measure Water Tank Height

Measure your water tank height in centimeters and update:

```cpp
#define TANK_HEIGHT_CM 100  // Your tank height
```

## Upload Process

1. **Connect ESP32** to computer via USB
2. **Select Board**: Tools → Board → ESP32 Dev Module
3. **Select Port**: Tools → Port → (Your COM port)
4. **Upload**: Click Upload button (→)
5. **Open Serial Monitor**: Tools → Serial Monitor (115200 baud)

## Testing

### 1. Check Serial Monitor Output

You should see:
```
=================================
AgroSmartHill IoT Device Starting
=================================

Connecting to WiFi: YourWiFiName
...........
✓ WiFi Connected!
IP Address: 192.168.1.XXX

Setup complete! Starting main loop...

--- Sensor Readings ---
Soil Moisture: 45.2%
Temperature: 28.5°C
Humidity: 65.0%
Water Tank: 75.0%
----------------------

Sending sensor data to server...
✓ Data sent successfully!
```

### 2. Check Backend Logs

In your backend terminal, you should see:
```
POST /api/sensors/data 200
```

### 3. Check Dashboard

Open http://localhost:5173 and verify:
- Sensor cards update with real values
- Moisture gauge shows correct percentage
- Temperature and humidity display correctly

## Troubleshooting

### WiFi Not Connecting
- Check SSID and password
- Ensure ESP32 is within WiFi range
- Try 2.4GHz WiFi (ESP32 doesn't support 5GHz)

### Sensor Readings Show NaN or 0
- Check wiring connections
- Verify sensor power (3.3V or 5V)
- Check if DHT22 library is installed

### Data Not Reaching Server
- Verify server IP address
- Check if backend is running (port 5000)
- Verify JWT token is valid
- Check firewall settings

### Pump Not Activating
- Check relay wiring
- Verify 12V power supply
- Test relay manually with digitalWrite(23, HIGH)
- Check pump power requirements

## Power Options

### Option 1: USB Power (Testing)
- Connect ESP32 via USB
- Use separate 12V adapter for pump

### Option 2: Solar Power (Production)
- 10W-20W Solar Panel
- 12V 7Ah Battery
- Charge Controller
- 5V Buck Converter for ESP32

## Next Steps

1. ✅ Upload code to ESP32
2. ✅ Verify sensor readings in Serial Monitor
3. ✅ Check data appears in dashboard
4. ✅ Test irrigation control
5. ✅ Deploy to field
6. ✅ Monitor for 24 hours
7. ✅ Adjust thresholds as needed

## Safety Notes

⚠️ **Important Safety Guidelines:**
- Never run pump without water (dry running damages pump)
- Use waterproof enclosure for outdoor deployment
- Ensure proper grounding for electrical safety
- Keep electronics away from water
- Use appropriate wire gauge for pump current
- Add fuse protection for pump circuit

## Support

If you encounter issues:
1. Check Serial Monitor for error messages
2. Verify all connections match the diagram
3. Test each sensor individually
4. Check backend API is accessible
5. Review token expiration (tokens expire after 7 days)
