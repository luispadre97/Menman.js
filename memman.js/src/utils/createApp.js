import {
    withCurrentComponent,
    triggerRerender as _triggerRerender,
  } from "./Hooks";
  
  function createContext(deps) {
    return {
      get: function (key) {
        return deps[key];
      },
    };
  }
  
  export function createApp(rootComponent, deps = {}) {
    const context = createContext(deps);
  
    return {
      mount: function mount(selector) {
        const appElement = document.querySelector(selector);
        appElement.innerHTML = ""; // Limpiar el contenido del elemento
        const component = withCurrentComponent(rootComponent)(context);
        if (component instanceof Node) {
          appElement.appendChild(component); // Agregar el componente al DOM con el contexto
        } else {
          console.error("Error: el componente no es un objeto Node válido");
        }
      },
    };
  }
  