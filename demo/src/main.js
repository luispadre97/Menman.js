
import { createApp } from './../../memman.js/dist/bundle'
import HelloWorld from './components/HelloWorld.jsx';
import { Button } from 'vant';
import 'vant/lib/index.css'

const deps = {
    Button: Button // inyectar el componente Button de Vant como una dependencia llamada "Button"
}

const app = createApp(HelloWorld, deps);
app.mount('#app');