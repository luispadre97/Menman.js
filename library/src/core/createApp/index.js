import { render } from '../render';
import { createContext } from './createContext';

export function createApp(component, deps = {}) {
  const context = createContext(deps);
  return {
    mount: function mount(selector) {
      const appElement = document.querySelector(selector);
      appElement.innerHTML = "";
      const props = { context };
      render(() => component(props), appElement);
    },
  };
}