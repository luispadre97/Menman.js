export default function transformMemmanJsx({ types: t }) {
  function convertAttribute(attr) {
    if (t.isJSXSpreadAttribute(attr)) {
      return t.spreadElement(attr.argument);
    } else if (t.isJSXNamespacedName(attr.name)) {
      return t.objectProperty(
        t.stringLiteral(attr.name.namespace.name + ':' + attr.name.name.name),
        attr.value
      );
    } else if (t.isJSXExpressionContainer(attr.value)) {
      if (t.isJSXElement(attr.value.expression)) {
        const type = t.stringLiteral(attr.value.expression.openingElement.name.name);
        const props = attr.value.expression.openingElement.attributes.length
          ? convertAttributes(attr.value.expression.openingElement.attributes)
          : t.nullLiteral();
        const children = attr.value.expression.children
          .map(convertJSXElement)
          .filter(Boolean);

        const args = [type, props].concat(children.length > 0 ? [t.arrayExpression(children)] : []);

        return t.objectProperty(t.identifier('children'), t.callExpression(t.identifier('__createElement'), args));
      } else {
        if (t.isStringLiteral(attr.value.expression)) {
          return t.objectProperty(t.identifier(attr.name.name), attr.value.expression);
        } else {
          return t.objectProperty(t.identifier(attr.name.name), attr.value.expression);
        }
      }
    } else {
      return t.objectProperty(
        t.stringLiteral(attr.name.name),
        attr.value || t.booleanLiteral(true)
      );
    }
  }

  function convertAttributes(attrs) {
    const props = attrs.map(convertAttribute);
    return t.objectExpression(props);
  }

  function convertJSXElement(node) {
    // Para manejar fragmentos, verifica si el nodo es un fragmento de JSX
    if (t.isJSXFragment(node)) {
      const children = node.children
        .map(convertJSXElement)
        .filter(Boolean);
  
      return t.arrayExpression(children);
    }
  
    // Agregar este caso para manejar nodos de texto
    if (t.isJSXText(node)) {
      const content = node.value.trim();
      if (content !== '') {
        return t.objectExpression([
          t.objectProperty(t.stringLiteral('type'), t.stringLiteral('text')),
          t.objectProperty(t.stringLiteral('content'), t.stringLiteral(content)),
        ]);
      } else {
        return null;
      }
    }
  
    // Agregar este caso para manejar componentes personalizados
    if (t.isJSXElement(node) && node.openingElement.name.type === 'JSXIdentifier') {
      const type = t.stringLiteral(node.openingElement.name.name);
      const props = node.openingElement.attributes.length
        ? convertAttributes(node.openingElement.attributes)
        : t.nullLiteral();
      const children = node.children
        .map(convertJSXElement)
        .filter(Boolean);
  
      const args = [type, props].concat(children.length > 0 ? [t.arrayExpression(children)] : []);
  
      return t.callExpression(t.identifier('__createElement'), args);
    }
    
    // Agregar este caso adicional para manejar componentes personalizados con nombres calificados (namespace)
    if (t.isJSXElement(node) && node.openingElement.name.type === 'JSXNamespacedName') {
      const type = t.stringLiteral(node.openingElement.name.namespace.name + ':' + node.openingElement.name.name.name);
      const props = node.openingElement.attributes.length
        ? convertAttributes(node.openingElement.attributes)
        : t.nullLiteral();
      const children = node.children
        .map(convertJSXElement)
        .filter(Boolean);
  
      const args = [type, props].concat(children.length > 0 ? [t.arrayExpression(children)] : []);
  
      return t.callExpression(t.identifier('__createElement'), args);
    }
  }
  
  

  return {
    visitor: {
      JSXElement(path) {
        path.replaceWith(convertJSXElement(path.node));
      },
      // Agrega un visitante adicional para manejar fragmentos de JSX
      JSXFragment(path) {
        path.replaceWith(convertJSXElement(path.node));
      },
    },
  };
}