import { createApp } from './../src/index.js';
import HelloWorld from './components/HelloWorld.js';

const app = createApp(HelloWorld);
app.mount('#app');