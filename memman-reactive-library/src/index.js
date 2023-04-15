import Observable from './observable.js';
class ReactiveElement {
    props = new Map();
    computedProps = new Map();
    watchers = new Map();

    setProp(key, value) {
        let observable = this.props.get(key);
        if (!observable) {
            observable = new Observable(value);
            this.props.set(key, observable);
        }
        observable.notify(value);
    }

    getProp(key) {
        const observable = this.props.get(key);
        return observable ? observable.value : undefined;
    }

    onPropChange(key, callback, filter, priority) {
        const observable = this.props.get(key);
        if (observable) {
            const unsubscribe = observable.subscribe(callback, filter, priority);
            return () => {
                unsubscribe();
            };
        }
        return () => { };
    }

    registerComputed(key, computeFn) {
        const computedProp = new Observable(computeFn());
        this.computedProps.set(key, computedProp);

        const updateComputed = () => {
            computedProp.notify(computeFn());
        };

        computeFn.dependencies.forEach((dependency) => {
            this.onPropChange(dependency, updateComputed);
        });

        return () => {
            this.computedProps.delete(key);
        };
    }

    watch(key, callback) {
        const watcher = () => {
            const value = this.getProp(key);
            callback(value);
        };
        this.watchers.set(key, watcher);
        const unsubscribe = this.onPropChange(key, watcher);

        return () => {
            this.watchers.delete(key);
            unsubscribe();
        };
    }
}

class ReactiveComponent extends ReactiveElement {
    _parent = null;

    constructor(props, ...children) {
        super(props);
        this.children = children;
    }

    render() {
        // Sobrescribe este método en las subclases
    }

    componentDidUpdate() {
        if (this._parent) {
            render(this, this._parent);
        }
    }
}

function createElement(type, props, ...children) {
    let element;
    console.log(props,'props')
    // return null
    if (typeof type === 'string') {
        element = document.createElement(type);
        if (props) {
            Object.entries(props).forEach(([key, value]) => {
                if (key.startsWith('on')) {
                    const eventName = key.slice(2).toLowerCase();
                    element.addEventListener(eventName, value);
                } else {
                    element[key] = value;
                }
            });
        }
    } else if (type.prototype instanceof ReactiveElement) {
        const component = new type(props, ...children);
        component.props.forEach((observable, key) => {
            observable.subscribe(() => {
                render(component, component._parent);
            });
        });
        element = component.render();
    } else {
        throw new Error(`Unsupported type: ${type}`);
    }

    children
        .flat()
        .map((child) => {
            if (child instanceof ReactiveElement) {
                return render(child, element);
            } else if (child instanceof Node) {
                return child;
            } else {
                return document.createTextNode(child);
            }
        })
        .forEach((child) => {
            element.appendChild(child);
        });

    return element;
}

function render(component, container) {
    component._parent = container;
    const newRenderResult = component.render();

    const isSameNode = (node1, node2) => {
        if (node1.nodeType !== node2.nodeType) return false;
        if (node1.nodeType === Node.TEXT_NODE) {
            return node1.textContent === node2.textContent;
        }
        if (node1.tagName !== node2.tagName) return false;
        return true;
    };

    const updateNode = (oldNode, newNode) => {
        if (!isSameNode(oldNode, newNode)) {
            oldNode.replaceWith(newNode);
            return;
        }

        if (oldNode.nodeType === Node.ELEMENT_NODE) {
            const newAttributes = [...newNode.attributes];
            newAttributes.forEach((attr) => {
                oldNode.setAttribute(attr.name, attr.value);
            });

            const oldAttributes = [...oldNode.attributes];
            oldAttributes.forEach((attr) => {
                if (!newNode.hasAttribute(attr.name)) {
                    oldNode.removeAttribute(attr.name);
                }
            });
        }

        const oldChildNodes = [...oldNode.childNodes];
        const newChildNodes = [...newNode.childNodes];
        const commonLength = Math.min(oldChildNodes.length, newChildNodes.length);

        for (let i = 0; i < commonLength; i++) {
            updateNode(oldChildNodes[i], newChildNodes[i]);
        }

        if (oldChildNodes.length > commonLength) {
            oldChildNodes.slice(commonLength).forEach((child) => child.remove());
        }

        if (newChildNodes.length > commonLength) {
            newChildNodes.slice(commonLength).forEach((child) => oldNode.appendChild(child));
        }
    };

    updateNode(container, newRenderResult);
}

export { ReactiveComponent, createElement, render };
