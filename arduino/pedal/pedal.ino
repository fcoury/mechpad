const int SWITCH_PIN = 8;
const long HOLD_WAIT = 700;

int clicks = 0;
int switchPressed = 0;
long firstPressed = -1;
long lastPressed;
bool isHeld = false;

void setup() {
  Serial.begin(9600);

  // sets pin to Input mode and activates the pullup resistor
  // since the switch is wired on an active high fashion
  pinMode(SWITCH_PIN, INPUT);
  digitalWrite(SWITCH_PIN, HIGH);
}

void loop() {
  // if the switch is no longer press (active HIGH)
  // we can reset the isHeld flag and wait 10 seconds
  if (digitalRead(SWITCH_PIN) == HIGH) {
    isHeld = false;
    delay(10);
  }

  // if the switch is held we don't need to detect
  // clicks because it already handled the hold
  if (isHeld) {
    return;
  }

  // if the switch is pressed, turn on the flag
  // and captures the time it was first pressed (regardless of check cycle)
  // and when it was last pressed (within this press cycle)
  if (digitalRead(SWITCH_PIN) == LOW) {
    switchPressed = 1;
    if (firstPressed == -1) {
      firstPressed = millis();
    }
    lastPressed = millis();
  }

  // how long ago it was pressed on this 250ms cycle
  long difference = millis() - lastPressed;
  if (switchPressed == 1) {
    // takes 50ms to consider a click
    if (difference > 50) {
      clicks++;
      switchPressed = 0;
    }
  }

  // how long ago it was pressed, regardless of the cycle
  long firstDiff = millis() - firstPressed;
  // if it was pressed 250ms ago or if we're holding it enough 
  // to consider it a hold
  if (difference > 250 || firstDiff > HOLD_WAIT) {
    // if it was pressed for longer then the time to consider a hold
    if (firstPressed > -1 && firstDiff > HOLD_WAIT) {
      // reset the press flag and click counter
      switchPressed = 0;
      clicks = 0;

      // indicates we have a hold, and set the held flag
      Serial.println("Hold");
      isHeld = true;
    } else {
      // otherwise, if we had only one click within the cycle
      if (clicks == 1) {
        // consider it a Click
        Serial.println("Click");
      } else if (clicks == 2) {
        // if we had 2, consider it a double click
        Serial.println("DblClick");
      }
    }

    // resets the click counter and the time when it was initially pressed
    clicks = 0;
    firstPressed = -1;
  }
}
