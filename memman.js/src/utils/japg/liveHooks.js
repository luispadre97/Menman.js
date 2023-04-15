
import MemmanEmitter from './emitter';

export function createMemmaLive() {
  const emitter = new MemmanEmitter();
  const dependencies = new Map();
  let currentDep = null;

  const handler = {
    get(target, prop, receiver) {
      if (currentDep) {
        if (!dependencies.has(prop)) {
          dependencies.set(prop, new Set());
        }
        dependencies.get(prop).add(currentDep);
      }
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      const result = Reflect.set(target, prop, value, receiver);
      if (dependencies.has(prop)) {
        const deps = dependencies.get(prop);
        deps.forEach((dep) => dep());
      }
      emitter.emit(prop, value);
      return result;
    },
  };

  class Live {
    constructor(initialValue) {
      this.value = new Proxy(initialValue, handler);
      this.subscribers = new Map();
    }

    set(newValue) {
      Object.keys(newValue).forEach((key) => {
        this.value[key] = newValue[key];
      });
    }
    get() {
      return this.value;
    }
    subscribe(event, callback) {
      const id = Math.random().toString(36).substr(2, 9);
      this.subscribers.set(id, callback);
      emitter.on(event, callback);
      return id;
    }
    unsubscribe(id) {
      const callback = this.subscribers.get(id);
      if (callback !== undefined) {
        emitter.off(event, callback);
        this.subscribers.delete(id);
      }
    }
  }

  function useLiveState(initialState) {
    const live = new Live(initialState);

    function setState(newState) {
      live.set(newState);
    }

    function createSubscriber(event, prop, callback) {
      createDependency(() => {
        live.subscribe(event, () => {
          watch(live.value, prop, callback);
        });
      });
    }

    function subscribe(event, prop, callback) {
      const id = createDependency(() => {
        live.subscribe(event, () => {
          createSubscriber(event, prop, callback);
        });
      });
      return id;
    }

    function unsubscribe(id) {
      const callback = live.subscribers.get(id);
      if (callback !== undefined) {
        live.unsubscribe(id);
      }
    }

    function createDependency(callback) {
      currentDep = callback;
      callback();
      currentDep = null;
      return Math.random().toString(36).substr(2, 9);
    }
    function watch(obj, prop, callback) {
      if (!(prop in obj)) {
        throw new Error(`Property "${prop}" does not exist in object`);
      }
      let value = obj[prop];
      let oldPropertyDescriptor = Object.getOwnPropertyDescriptor(obj, prop);
      Object.defineProperty(obj, prop, {
        get() {
          return value;
        },
        set(newValue) {
          value = newValue;
          obj.renderedValue = value;
          callback(value);
        },
      });
      return {
        unsubscribe() {
          Object.defineProperty(obj, prop, oldPropertyDescriptor);
        }
      };
    }


    return [live.value, setState, createDependency, subscribe, unsubscribe];
  }

  function useLiveEffect(callback, dependencies) {

    dependencies.forEach(dependency => {
      emitter.on(dependency, callback);
    });
  
    const emitEvent = (event, ...args) => {
      emitter.emit(event, ...args);
    };
  
    return {
      emitEvent,
      unsubscribe: () => {
        dependencies.forEach(dependency => {
          emitter.off(dependency, callback);
        });
      }
    };
  }


  return { useLiveState, useLiveEffect };
}