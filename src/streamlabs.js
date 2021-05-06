const SockJS = require('sockjs-client');

class Obs {
  constructor(config) {
    this.config = config;
    this.nextRequestId = 1;
    this.requests = {};
    this.url = `http://127.0.0.1:${config.port}/api`;
    this.socket = new SockJS(this.url);
    this.socket.onopen = async () => {
      console.log('Streamlabs connection open');
      await this.auth();
      this.onConnectionHandler();
    };
    this.socket.onmessage = (e) => {
      this.onMessageHandler(e.data);
    };
  }

  async auth() {
    await this.request('TcpServerService', 'auth', this.config.token);
  }

  onConnectionHandler() {
    console.log('requesting scenes');
    this.request('ScenesService', 'getScenes').then(scenes => {
      this.scenes = scenes;
    }).catch(err => console.error('Error getting scenes', err));
  }

  onMessageHandler(data) {
    const message = JSON.parse(data);
    const request = this.requests[message.id];

    console.log('Incoming message', message);

    if (!request) {
      console.warn('request not found', data);
      return;
    }

    if (message.error) request.reject(message.error);
    if (message.result) request.resolve(message.result);
    delete this.requests[message.id];
  }

  request(resource, method, ...args) {
    const id = this.nextRequestId++;
    const body = {
      jsonrpc: '2.0',
      id,
      method,
      params: { resource, args }
    };

    console.log('*** Sending request', resource, method, ...args);
    return this.sendMessage(body);
  }

  sendMessage(message) {
    const body = typeof message === 'string' ? JSON.parse(message) : message;
    return new Promise((resolve, reject) => {
      this.requests[message.id] = {
        body, resolve, reject, completed: false
      };
      this.socket.send(JSON.stringify(body));
    });
  }

  getScene(name) {
    return this.scenes.find(s => s.name === name);
  }

  async currentScene() {
    const currentScene = await this.request('ScenesService', 'activeScene')
      .catch(err => console.error('Error getting current scene', err));
    console.log('currentScene', currentScene.name);
    return this.scenes.find(s => s.id === currentScene.id);
  }

  async changeScene(sceneName) {
    console.log('Changing to scene', sceneName);
    const scene = this.getScene(sceneName);
    console.log(scene);
    return await this.request('ScenesService', 'makeSceneActive', scene.id)
      .catch(err => console.error('Error changing to', sceneName, err));
  }
}

module.exports = Obs;
