const OBSWebSocket = require('obs-websocket-js');

class Obs {
  constructor() {
    this.obs = new OBSWebSocket();
  }

  async send(cmd, args) {
    await this.init();
    return this.obs.send(cmd, args);
  }

  async init() {
    if (!this.initialized) {
      await this.obs.connect();
      this.initialized = true;
    } 
  }

  async currentScene() {
    return await this.send('GetCurrentScene');
  }

  async changeScene(sceneName) {
    return await this.send('SetCurrentScene', { 'scene-name': sceneName });
  }
}

module.exports = Obs;