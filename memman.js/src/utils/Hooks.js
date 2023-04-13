

let currentEffect = null;

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

export function withCurrentComponent(fn) {
    return function (...args) {
        const previousComponent = currentComponent;
        currentComponent = {};
        const result = fn(...args);
        currentComponent = previousComponent;
        return result;
    };
}

// export function triggerRerender() {
//   componentEffects.forEach((effects, component) => {
//     effects.forEach((effect) => {
//       if (effect.cleanup) {
//         effect.cleanup();
//       }
//       effect.cleanup = effect.fn();
//     });
//   });
// }
function render(jsx, container) {
    container.innerHTML = jsx;
}
export function triggerRerender() {
    componentEffects.forEach((effects, component) => {
        effects.forEach((effect) => {
            if (effect.cleanup) {
                effect.cleanup();
            }
            effect.cleanup = effect.fn();
        });
    });
}

export function memmanUseEffect(fn, deps) {
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

export function memmanCreateSignal(initialValue) {
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
        if (currentEffect) {
            effects.add(currentEffect);
        }
        return value;
    }

    return [getter(get), set];
}
