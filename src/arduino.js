const Readline = require('@serialport/parser-readline');
const SerialPort = require('serialport');

class Arduino {
  constructor(port) {
    this.port = port;
  }

  async init() {
    this.port = this.port || await this.detect();
    if (!this.port) {
      throw new Error('Could not auto detect your Arduino, please specify the port on the config.json file');
    }

    console.log('Connecting to Arduino on port', this.port);
    const serialPort = new SerialPort(this.port, { baudRate: 9600 });
    const parser = new Readline();
    serialPort.pipe(parser);
    parser.on('data', line => {
      return this.onMessage(line);
    });
  }

  detect() {
    return new Promise((resolve, reject) => {
      SerialPort.list((err, ports) => {
        if (err) {
          return reject(`Error trying to auto detect Arduino: ${err}`);
        }
        const port = ports.find(p => p.manufacturer && p.manufacturer.toLowerCase().includes('arduino'));
        return resolve(port && port.comName);
      });
    });
  }
}

module.exports = Arduino;
