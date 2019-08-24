const fs = require('fs');
const _ = require('lodash');

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
    return Object.keys(actions).reduce((obj, a) => {
      const def = actions[a];
      const [actionFn, param] = _.isArray(def) ? def : [def, null];
      obj[a] = () => this[actionFn].bind(this)(param);
      return obj;
    }, {});
  }

  async changeTo(scene) {
    return await this.obs.changeScene(scene);
  }

  async prevScene() {
    return this.addScene(-1);
  }

  async nextScene() {
    return this.addScene(1);
  }

  async addScene(delta) {
    const { scenes } = this.props;
    const currentScene = await this.obs.currentScene();
    if (!currentScene) {
      return;
    }
    let idx = scenes.indexOf(currentScene.name);
    while (true) {
      let newIdx = idx + delta;
      if (newIdx > scenes.length - 1) {
        newIdx = 0;
      }
      if (newIdx < 0) {
        newIdx = scenes.length - 1;
      }
      const newScene = scenes[newIdx];
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
