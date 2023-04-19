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


export { createObservable, reactive, watch }