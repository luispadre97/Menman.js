// Crear un objeto de contexto que contenga las dependencias
function createContext(deps) {
  return {
    get: function (key) {
      return deps[key];
    },
  };
}

// Modificar la función createApp para aceptar un objeto de dependencias
export function createApp(rootComponent, deps = {}) {
  const context = createContext(deps);

  return {
    mount: function (selector) {
      const appElement = document.querySelector(selector);
      appElement.innerHTML = ''; // Limpiar el contenido del elemento
      appElement.appendChild(rootComponent(context)); // Agregar el componente al DOM con el contexto
    },
  };
}