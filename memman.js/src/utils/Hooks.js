
let _triggerRerender = null; // agrega esta línea para declarar la variable
const currentComponentStack = [];
let triggerRerender = null;

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

    const parent = this && this.parentNode;

    const triggerRerender = () => {
      _triggerRerender();
      setTimeout(() => {
        const newVNode = componentFunction.apply(this, args);
        replaceVNode(vNode, newVNode, parent);
      });
    };

    if (!_triggerRerender) {
      _triggerRerender = triggerRerender;
    }

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
            if (triggerRerender) triggerRerender();
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
export {
  withCurrentComponent,
  memmanCreateSignal,
  memmanUseEffect,
  memmanRef,
  memmanUse,
  memmanUseState,
  memmanUseCallback,
  memmanUseReducer,
  memmanUseMemo,
  memmanUseRef,
  memmanUseLayoutEffect,
  triggerRerender,
};
