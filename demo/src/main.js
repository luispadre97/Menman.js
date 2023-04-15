
import { createApp } from './../../memman.js/dist/bundle'

import HelloWorld from './components/HelloWorld.memman';
import { Button } from 'vant';
import 'vant/lib/index.css'

const deps = {
    Button: Button // inyectar el componente Button de Vant como una dependencia llamada "Button"
}

const app = createApp(HelloWorld, deps);
app.mount('#app');


// // import { createApp } from './../../memman.js/dist/bundle'
// import { createApp } from './../../memman2js/src/index'
// import HelloWorld from './components/HelloWorld.memman';
// import { Button } from 'vant';
// import 'vant/lib/index.css'

// const deps = {
//     Button: Button // inyectar el componente Button de Vant como una dependencia llamada "Button"
// }
// // const app = createApp(HelloWorld, { depsContext: globalDepsContext });

// const app = createApp(HelloWorld, {depsContext:deps});
// app.mount('#app');