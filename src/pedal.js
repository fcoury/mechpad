const _ = require('lodash');

class Pedal {
  constructor(commandMap, arduino) {
    this.arduino = arduino;
    this.commandMap = commandMap;

    this.arduino.onMessage = this.handleMessage.bind(this);
  }

  handleMessage(msg) {
    const cmdStr = msg && msg.trim();
    const cmd = _.get(this.commandMap, cmdStr);
    console.log('Executing', cmdStr);
    if (cmd) {
      cmd();
    } else {
      console.warn('Command not found:', msg);
    }
  }
}

module.exports = Pedal;
