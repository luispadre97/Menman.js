"use strict";

import { triggerRerender } from './Hooks'
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

function setState(json) {
    // Restaura el estado del framework a partir de una cadena JSON
    try {
        const newState = JSON.parse(json);
        state.components = newState.components;
        state.lastId = newState.lastId;
    } catch (e) {
        console.error("Error al parsear el estado: ", e);
    }

    // Restaurar los elementos en el DOM
    Object.entries(state.components).forEach(([id, element]) => {
        const elementToRestore = document.querySelector(`[data-memman-id="${id}"]`);
        if (elementToRestore) {
            elementToRestore.replaceWith(element);
        }
    });
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
// Exporta las funciones necesarias para crear y renderizar componentes de Memman
export { createElement, createComponent, renderMemmanComponent, updateState, useDynamicState };            