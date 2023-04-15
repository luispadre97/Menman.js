let globalDepsContext = null;

function createContext(deps) {
    return {
        get: function (key) {
            return Object.assign({}, globalDepsContext.get(), deps)[key];
        },
    };
}

export function createApp(rootComponent, deps = {}) {
    globalDepsContext = createContext(deps);

    return {
        mount: function mount(selector) {
            const appElement = document.querySelector(selector);
            appElement.innerHTML = "";
            const props = { depsContext: globalDepsContext };
            const component = rootComponent(props);
            appElement.appendChild(component);
        }
    }
}
