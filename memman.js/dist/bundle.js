var version = "0.0.1";

const currentComponentStack = [];

let currentEffect = null;
const currentUpdateEffects = new Set();


function runUpdateEffects() {
    const updateEffects = Array.from(currentUpdateEffects);
    currentUpdateEffects.clear();

    for (const effect of updateEffects) {
        if (effect.cleanup) {
            effect.cleanup();
        }

        effect.cleanup = effect.fn();
    }
}
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
function getCurrentComponent() {
  return currentComponentStack[currentComponentStack.length - 1];
}

function withCurrentComponent(componentFunction) {
  return function renderWithContext(...args) {
    const componentInstance = componentFunction.apply(this, args);
    const vNode = typeof componentInstance === "function" ? componentInstance() : componentInstance;

    this && this.parentNode;

    return vNode;
  };
}

// ... (Todas las funciones de hooks y funciones relacionadas aquí)

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
            runUpdateEffects();
        }
        return [getter(get), set];

    }

    function get() {
        if (currentEffect) {
            effects.add(currentEffect);
        }
        runUpdateEffects();
        return value;
    }

    // Usar 'getter' aquí
    return [getter(get), set];

}

const componentEffects = new Map();

function memmanUseEffect(fn, deps) {
    const component = getCurrentComponent();
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


// A continuación, las funciones restantes se mantienen sin cambios

function memmanRef(initialValue) {
    return { current: initialValue };
}

function memmanUse(hookFunction, ...args) {
    return hookFunction(...args);
}

function memmanUseState(initialValue) {
    const [get, set] = memmanCreateSignal(initialValue);

    function setState(newValue) {
        if (typeof newValue === "function") {
            set((prevValue) => newValue(prevValue));
        } else {
            set(newValue);
        }
    }

    return [get(), setState];
}

function memmanUseCallback(callback, dependencies) {
    const [get, set] = memmanCreateSignal(callback);

    memmanUseEffect(() => {
        set(callback);
    }, dependencies);

    return get();
}

function memmanUseReducer(reducer, initialState) {
    const [state, setState] = memmanUseState(initialState);

    function dispatch(action) {
        const newState = reducer(state, action);
        setState(newState);
    }

    return [state, dispatch];
}

function memmanUseMemo(callback, dependencies) {
    const [get, set] = memmanCreateSignal(null);

    memmanUseEffect(() => {
        set(callback());
    }, dependencies);

    return get();
}

function memmanUseRef(initialValue) {
    return memmanCreateSignal(initialValue);
}

function memmanUseLayoutEffect(effect, dependencies) {
    if (dependencies && !Array.isArray(dependencies)) {
        throw new Error("Dependencies should be an array.");
    }

    const prevEffect = currentEffect;
    currentEffect = effect;

    const cleanup = memmanRef(null);

    const updateEffect = () => {
        if (cleanup.current) {
            cleanup.current();
        }
        cleanup.current = effect();
    };

    const prevDependencies = memmanUseRef(dependencies);

    if (!dependencies || !areDependenciesEqual(dependencies, prevDependencies.current)) {
        updateEffect();
        prevDependencies.current = dependencies;
    }
    currentEffect = prevEffect;

    return () => {
        if (cleanup.current) {
            cleanup.current();
        }
    };
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
            element.appendChild(document.createTextNode(String(result)));
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

function createContext(deps) {
    return {
      get: function (key) {
        return deps[key];
      },
    };
  }
  
  function createApp(rootComponent, deps = {}) {
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

function main () {
    console.log('version ' + version);
}

export { createApp, createComponent, createElement, main as default, memmanCreateSignal, memmanRef, memmanUse, memmanUseCallback, memmanUseEffect, memmanUseLayoutEffect, memmanUseMemo, memmanUseReducer, memmanUseRef, memmanUseState, renderMemmanComponent, updateState, useDynamicState };
