// Archivo Hooks.js
let currentComponent = null;
let componentEffects = new Map();

function getter(get) {
    return new Proxy(
        {},
        {
            get(target, prop) {
                if (prop === "valueOf" || prop === "toString") {
                    return get;
                }
                return Reflect.get(target, prop);
            },
            apply(target, thisArg, argumentsList) {
                return get.apply(thisArg, argumentsList);
            },
        }
    );
}

function withCurrentComponent(fn, depsContext) {
    return function (...args) {
      const previousComponent = currentComponent;
      currentComponent = {};
      const result = fn(...args, depsContext);
      currentComponent = previousComponent;
      return result;
    };
  }
function triggerRerender() {
    componentEffects.forEach((effects, component) => {
        effects.forEach((effect) => {
            if (effect.cleanup) {
                effect.cleanup();
            }
            effect.cleanup = effect.fn();
        });
    });
}

function memmanUseEffect(fn, deps) {
    const component = currentComponent;
    if (!component) {
        throw new Error("No hay un componente actual establecido.");
    }

    const effect = {
        fn,
        deps,
        cleanup: null,
    };

    const prevEffects = componentEffects.get(component) || new Set();
    const prevEffect = Array.from(prevEffects).find((x) => x.fn === fn);

    if (!prevEffect) {
        prevEffects.add(effect);
        componentEffects.set(component, prevEffects);
        return;
    }

    if (!deps) {
        effect.cleanup = prevEffect.cleanup;
        prevEffects.add(effect);
        componentEffects.set(component, prevEffects);
        return;
    }

    const depsChanged = !prevEffect.deps || deps.some((dep, i) => !Object.is(dep, prevEffect.deps[i]));

    if (depsChanged) {
        if (prevEffect.cleanup) {
            prevEffect.cleanup();
        }

        prevEffects.delete(prevEffect);
        prevEffects.add(effect);
        componentEffects.set(component, prevEffects);
    } else {
        prevEffects.add(prevEffect);
        componentEffects.set(component, prevEffects);
    }
}

function memmanCreateSignal(initialValue) {
    if (initialValue === undefined || initialValue === null) {
        throw new Error("Initial value cannot be null or undefined.");
    }

    let value = initialValue;
    let effects = new Set();

    function set(newValue) {
        if (typeof newValue === "function") {
            newValue = newValue(value);
        }

        if (value !== newValue) {
            value = newValue;
            effects.forEach((effect) => effect());
            triggerRerender();
        }
    }

    function get() {
        return value;
    }

    return [getter(get), set];
}

// Variable global para almacenar el estado del framework
const state = { components: {}, lastId: 0 };

function createElement(tagName, attributes = {}, ...children) {

    const element = document.createElement(tagName);

    // Añadir los atributos y eventos especificados al elemento
    if (attributes && typeof attributes === 'object') {
        for (const [key, value] of Object.entries(attributes)) {
            if (key === "className") {
                element.classList.add(value);
            } else if (key.startsWith("on")) {
                element.addEventListener(key.slice(2).toLowerCase(), value);
            } else if (key === "style") {
                if (typeof value === "object") {
                    Object.assign(element.style, value);
                } else {
                    element.setAttribute(key, value);
                }
            } else {
                element.setAttribute(key, value);
            }
        }
    }

    // Añadir los hijos especificados al elemento
    for (const child of children.flat()) {
        if (typeof child === "string") {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof HTMLElement) {
            element.appendChild(child);
        } else if (child && typeof child === "object" && child.type === "text") {
            // Aquí, verifica si el objeto hijo tiene una propiedad 'content' antes de intentar agregarla como nodo de texto
            if (child.hasOwnProperty("content")) {
                element.appendChild(document.createTextNode(child.content));
            }
        } else if (typeof child === "function") {
            // Añadir esta parte para manejar las funciones JavaScript
            const result = child();
            if (result instanceof HTMLElement) {
                element.appendChild(result);
            } else {
                element.appendChild(document.createTextNode(String(result)));
            }
        } else {
            // Añadir esta parte para manejar las expresiones JavaScript
            element.appendChild(document.createTextNode(String(child)));
        }
    }

    // Agregar un ID único al elemento
    const id = state.lastId++;
    element.setAttribute("data-memman-id", id);

    // Almacenar el elemento en el estado del framework
    state.components[id] = element;

    return element;
}


function getState() {
    // Devuelve una cadena JSON que representa el estado actual del framework
    return JSON.stringify(state);
}

function renderApp(component) {
    // Renderiza la aplicación en el servidor y devuelve el HTML renderizado
    const element = component.render();
    const stateScript = `<script>window.__MEMMAN_STATE__=${getState()}</script>`;
    element.innerHTML = stateScript + element.innerHTML;
    return element.outerHTML;
}

function createComponent(renderFn) {
    // Crea una clase de componente a partir de una función de renderizado
    class Component {
        constructor(props) {

            this.props = props;
            this.element = null;
            this.id = null;
        }
        render() {
            // Renderiza el componente y devuelve su elemento
            if (this.element) {
                return this.element;
            }
            this.element = renderFn(this.props);
            this.id = state.lastId++;
            this.element.setAttribute("data-memman-id", this.id);
            state.components[this.id] = this.element;
            return this.element;
        }
    }

    // Marca la clase como componente de Memman
    Component.isMemmanComponent = true;

    return Component;
}

function renderMemmanComponent(ComponentClass, props) {
    // Renderiza un componente de Memman en el servidor y devuelve el HTML renderizado
    const component = new ComponentClass(props);
    return renderApp(component);
}

function updateState(newState) {
    // Actualiza el estado del framework y renderiza de nuevo la aplicación
    try {
        state.components = newState.components;
        state.lastId = newState.lastId;
    } catch (e) {
        console.error("Error al actualizar el estado: ", e);
    }
    Object.entries(state.components).forEach(([id, element]) => {
        const elementToUpdate = document.querySelector(`[data-memman-id="${id}"]`);
        if (elementToUpdate) {
            elementToUpdate.replaceWith(element);
        }
    });
}

function useDynamicState(initialState) {
    const state = {
        value: initialState,
        setValue(newValue) {
            state.value = newValue;
            updateState(state);
        },
    };
    return [state.value, state.setValue];
}

let globalDepsContext = null;


function createContext(deps) {
  return {
    get: function (key) {
      return deps[key];
    },
  };
}

function createApp(rootComponent, deps = {}) {
  globalDepsContext = createContext(deps);
  
  let rootComponentInstance = null;
  return {
    mount: function mount(selector) {
      const appElement = document.querySelector(selector);
      appElement.innerHTML = ""; // Limpiar el contenido del elemento
      const component = withCurrentComponent(rootComponent)(globalDepsContext);
      if (component instanceof Node) {
        appElement.appendChild(component); // Agregar el componente al DOM con el contexto
        rootComponentInstance = component;
      } else {
        console.error("Error: el componente no es un objeto Node válido");
      }
    },
    triggerRerender: function triggerRerender$1() {
      if (rootComponentInstance) {
        triggerRerender();
      } else {
        console.error("Error: la aplicación no ha sido montada todavía");
      }
    },
  };
}

function withErrorBoundary(component, props) {
    try {
        return component(props);
    } catch (error) {
        console.error("Error in component:", error);
        // Puedes devolver una representación de un componente de error aquí, si lo deseas.
        return null;
    }
}

function main () {
    console.log('version ' + version);
}

export { createApp, createComponent, createElement, main as default, memmanCreateSignal, memmanUseEffect, renderMemmanComponent, triggerRerender, updateState, useDynamicState, withCurrentComponent, withErrorBoundary };
