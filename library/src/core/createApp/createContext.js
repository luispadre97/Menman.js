export function createContext(deps) {
    return {
        get: function (key) {
            return deps[key];
        },
    };
}