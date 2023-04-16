import createApp from '../../src/core/createApp';


export default function App() {
  return (
    `<div><h1>My Framework</h1></div>`
  );
}

const targetElement = document.getElementById('app');
createApp(App, targetElement);

