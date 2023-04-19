export function h(type, props, ...children) {
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
}