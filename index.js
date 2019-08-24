const App = require('./src/app');
const app = new App();
app.start().catch(err => console.error(err));

