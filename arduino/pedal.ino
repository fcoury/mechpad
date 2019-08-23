const int SWITCH_PIN = 8;

int switchPressed = 0;
long lastPressed;

void setup() {
  Serial.begin(9600);
  pinMode(SWITCH_PIN, INPUT);
  digitalWrite(SWITCH_PIN, HIGH);
}

void loop() {
  if (digitalRead(SWITCH_PIN) == LOW) {
    switchPressed = 1;
    lastPressed = millis();
  }

  long difference = millis() - lastPressed;
  if (switchPressed == 1 && difference > 250) {
    Serial.println("Click");
    switchPressed = 0;
  }
}
