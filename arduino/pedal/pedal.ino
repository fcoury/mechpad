const int SWITCH_PIN = 8;
const long HOLD_WAIT = 700;

int clicks = 0;
int switchPressed = 0;
long firstPressed = -1;
long lastPressed;
bool isHeld = false;

void setup() {
  Serial.begin(9600);
  pinMode(SWITCH_PIN, INPUT);
  digitalWrite(SWITCH_PIN, HIGH);
}

void loop() {
  if (digitalRead(SWITCH_PIN) == HIGH) {
    isHeld = false;
    delay(10);
  }
  if (isHeld) {
    return;
  }
  
  if (digitalRead(SWITCH_PIN) == LOW) {
    switchPressed = 1;
    if (firstPressed == -1) {
      firstPressed = millis();
    }
    lastPressed = millis();
  }

  long difference = millis() - lastPressed;
  if (switchPressed == 1) {
    if (difference > 50) {
      clicks++;
      switchPressed = 0;
    }
  }
  
  long firstDiff = millis() - firstPressed;
  if (difference > 250 || firstDiff > HOLD_WAIT) {
    if (firstPressed > -1 && firstDiff > HOLD_WAIT) {
      switchPressed = 0;
      clicks = 0;
      Serial.println("Hold");
      isHeld = true;
    } else {
      if (clicks == 1) {
        Serial.println("Click");
      } else if (clicks == 2) {
        Serial.println("DblClick");
      }
    }
    clicks = 0;
    firstPressed = -1;
  }
}
