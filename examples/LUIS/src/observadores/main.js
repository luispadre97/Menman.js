const createObservable = (target) => {
    const observers = new Set();

    const addObserver = (observer) => {
        observers.add(observer);
    };

    const removeObserver = (observer) => {
        observers.delete(observer);
    };

    const notifyObservers = (key, newValue, oldValue) => {
        observers.forEach((observer) => {
            try {
                observer.update(key, newValue, oldValue);
            } catch (error) {
                console.error(
                    `Error while notifying observer ${observer} for key ${key}: ${error}`
                );
            }
        });
    };

    const handler = {
        get: (target, key) => {
            return Reflect.get(target, key);
        },
        set: (target, key, value) => {
            const oldValue = Reflect.get(target, key);
            const success = Reflect.set(target, key, value);
            if (success) {
                notifyObservers(key, value, oldValue);
            }
            return success;
        },
    };

    const proxy = new Proxy(target, handler);
    return {
        proxy,
        addObserver,
        removeObserver,
    };
};

const reactive = (obj) => {
    if (typeof obj !== "object" || obj === null) {
        throw new Error("Invalid argument: expected an object");
    }

    const { proxy, addObserver, removeObserver } = createObservable(obj);
    return {
        state: proxy,
        observe: addObserver,
        unobserve: removeObserver,
    };
};

const watch = (reactiveObj, key, callback) => {
    if (
        typeof reactiveObj !== "object" ||
        reactiveObj === null ||
        !reactiveObj.hasOwnProperty("observe") ||
        typeof reactiveObj.observe !== "function"
    ) {
        throw new Error(
            "Invalid argument: expected a reactive object created with the 'reactive' function"
        );
    }

    if (typeof key !== "string" || !reactiveObj.state.hasOwnProperty(key)) {
        throw new Error("Invalid argument: expected a valid key for the reactive object");
    }

    if (typeof callback !== "function") {
        throw new Error("Invalid argument: expected a callback function");
    }

    const observer = {
        update: (updatedKey, newValue, oldValue) => {
            if (updatedKey === key) {
                callback(newValue, oldValue);
            }
        },
    };
    reactiveObj.observe(observer);
    return () => reactiveObj.unobserve(observer);
};


// // Ejemplo de uso

// const person = reactive({ name: "John", age: 25 });

// const unwatch = watch(person, "age", (newValue, oldValue) => {
//   console.log(`La edad ha cambiado de ${oldValue} a ${newValue}.`);
// });

// person.state.age = 26; // La edad ha cambiado de 25 a 26.
// person.state.age = 27; // La edad ha cambiado de 26 a 27.

// unwatch(); // Detiene la observación de la propiedad "age".

// person.state.age = 28; // No se mostrará nada porque la propiedad "age" ya no está siendo observada.
// console.log(person.state.age); // Imprime 28.

// try {
//   const invalidReactiveObj = {
//     state: { name: "John", age: 25 },
//     observe: () => {},
//     unobserve: () => {},
//   };
//   watch(invalidReactiveObj, "age", () => {}); // Lanza un error: "Invalid argument: expected a reactive object created with the 'reactive' function"
// } catch (error) {
//   console.error(error);
// }

// try {
//   const invalidKey = "invalidKey";
//   watch(person, invalidKey, () => {}); // Lanza un error: "Invalid argument: expected a valid key for the reactive object"
// } catch (error) {
//   console.error(error);
// }

// try {
//   watch(person, "age", "not a function"); // Lanza un error: "Invalid argument: expected a callback function"
// } catch (error) {
//   console.error(error);
// }


function createContext(deps) {
    return {
        get: function (key) {
            return deps[key];
        },
    };
}
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


export function h(type, props, ...children) {//createElement =)
    return { type, props, children };
  }
  
  export function render(vNode, container) {
    if (typeof vNode === 'function') {
      const reactiveObj = vNode();
      if (reactiveObj && typeof reactiveObj.__reactive_subscribe__ === "function") {
        watch(reactiveObj, () => {
          container.innerHTML = "";
          render(vNode(), container);
        });
        return () => render(vNode(), container); // Devuelve una función que renderiza el objeto reactivo
      } else {
        render(reactiveObj, container);
      }
    } else if (typeof vNode === 'string') {
      container.appendChild(document.createTextNode(vNode));
    } else if (vNode === null || vNode === undefined) {
      return;
    } else if (vNode.type === 'text') {
      container.appendChild(document.createTextNode(vNode.content));
    } else {
      const el = document.createElement(vNode.type);
      Object.assign(el, vNode.props);
      if (vNode.children && vNode.children.length > 0) {
        vNode.children.forEach((child) => {
          const childEl = render(child, el);
          if (childEl) {
            el.appendChild(childEl);
          }
        });
      }
      container.appendChild(el);
      return el;
    }
  }  ///////////////////////////
// Componente Counter
const Counter = ({ context }) => {
  const count = context.get("count");

  return (
    <div>Hol</div>
  )
};

// Crear una instancia de la aplicación con el componente Counter y una dependencia 'count'
const app = createApp(Counter, {
  count: reactive({ value: 0 }),
});

// Montar la aplicación en un elemento del DOM con el selector #app
app.mount("#app");