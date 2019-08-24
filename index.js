const fs = require('fs');

const Arduino = require('./src/arduino');
const Obs = require('./src/obs');
const Pedal = require('./src/pedal');

const commandMap = {
  Click: changeNextScene,
  DblClick: changePrevScene,
  Hold: changeMainScene,
};

const arduino = new Arduino();
const obs = new Obs();
const pedal = new Pedal(commandMap, arduino);

let scenes;
let config;

async function main() {
  try {
    config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
    scenes = config.scenes;
    console.log('Switching between', scenes);
    await arduino.init(config.port);
  } catch (err) {
    console.error("Error", error);
  }
}

async function changeMainScene() {
  return await obs.changeScene('Face New');
}

async function changePrevScene() {
  return changeNextScene(-1);
}

async function changeNextScene(delta=1) {
  const currentScene = await obs.currentScene();
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
      await obs.changeScene(newScene);
      break;
    } catch (err) {
      console.error('Error changing to scene', newScene, '. Error was:', err);
      idx = idx + 1;
    }
  }
}

main();
