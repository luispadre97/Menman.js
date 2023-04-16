
// ReactiveComponents
export function h(type, props, ...children) {
    return { type, props, children };
  }
  
  export function render(vNode, container) {
    if (typeof vNode === 'function') {
      render(vNode(), container);
    } else if (typeof vNode === 'string') {
      container.appendChild(document.createTextNode(vNode));
    } else if (vNode === null || vNode === undefined) {
      return;
    } else {
      const el = document.createElement(vNode.type);
      for (const key in vNode.props) {
        el[key] = vNode.props[key];
      }
      vNode.children.forEach((child) => render(child, el));
      container.appendChild(el);
    }
  }
  