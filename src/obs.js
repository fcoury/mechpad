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
    return await this.send('GetCurrentScene')
      .catch(err => console.error('Error getting current scene', err));
  }

  async changeScene(sceneName) {
    console.log('Changing to scene', sceneName);
    return await this.send('SetCurrentScene', { 'scene-name': sceneName })
      .catch(err => console.error('Error changing to', sceneName, err));
  }
}

module.exports = Obs;
