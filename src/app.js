const fs = require('fs');

const Arduino = require('./arduino');
const Obs = require('./obs');
const Pedal = require('./pedal');

class App {
  async start() {
    this.readConfig();
    this.obs = new Obs();
    this.arduino = new Arduino();
    await this.arduino.init(this.config.port);
    this.pedal = new Pedal(this.parseCommandMap(), this.arduino)
  }

  async readConfig() {
    this.config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
    console.log('Actions', this.config.actions);
    this.props = this.config.properties;
    console.log('Properties', this.props);
  }

  parseCommandMap() {
    const { actions } = this.config;
    console.log('actions', actions);
    return Object.keys(actions).reduce((obj, a) => {
      obj[a] = this[actions[a]].bind(this);
      return obj;
    }, {});
  }

  async mainScene() {
    return await this.obs.changeScene(this.props.mainScene);
  }

  async prevScene() {
    return this.nextScene(-1);
  }

  async nextScene(delta=1) {
    const { scenes } = this.props;
    const currentScene = await this.obs.currentScene();
    if (!currentScene) {
      return;
    }
    let idx = scenes.indexOf(currentScene.name);
    while (true) {
      let newIdx = idx + delta;
      if (newIdx > idx < scenes.length - 1) {
        newIdx = 0;
      }
      if (newIdx < 0) {
        newIdx = scenes.length - 1;
      }
      const newScene = scenes[newIdx];
      console.log('Changing to scene', newScene);
      try {
        await this.obs.changeScene(newScene);
        break;
      } catch (err) {
        console.error('Error changing to scene', newScene, '. Error was:', err);
        idx = idx + 1;
      }
    }
  }
}

module.exports = App;
