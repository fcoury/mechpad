const fs = require('fs');

const Arduino = require('./src/arduino');
const Obs = require('./src/obs');
const Pedal = require('./src/pedal');

const commandMap = {
  Click: changeNextScene,
};

const arduino = new Arduino();
const obs = new Obs();
const pedal = new Pedal(commandMap, arduino);

let scenes;
async function main() {
  const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
  scenes = config.scenes;
  console.log('Switching between', scenes);
  await arduino.init();
}

async function changeNextScene() {
  const currentScene = await obs.currentScene();
  let idx = scenes.indexOf(currentScene.name);
  while (true) {
    const newIdx = idx < scenes.length - 1 ? idx + 1 : 0;
    const newScene = scenes[newIdx];
    console.log('Changing to scene', newScene);
    try {
      await obs.changeScene(newScene);
      break;
    } catch (err) {
      console.error('Error changing to scene', newScene, '. Error was:', err);
      idx = idx + 1;
    }
  }
}

main();