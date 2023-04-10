function transformMemmanJsx(_ref) {
  var t = _ref.types;
  function convertAttribute(attr) {
    if (t.isJSXSpreadAttribute(attr)) {
      return t.spreadElement(attr.argument);
    } else if (t.isJSXNamespacedName(attr.name)) {
      return t.objectProperty(t.stringLiteral(attr.name.namespace.name + ':' + attr.name.name.name), attr.value);
    } else if (t.isJSXExpressionContainer(attr.value)) {
      if (t.isJSXElement(attr.value.expression)) {
        var type = t.stringLiteral(attr.value.expression.openingElement.name.name);
        var props = attr.value.expression.openingElement.attributes.length ? convertAttributes(attr.value.expression.openingElement.attributes) : t.nullLiteral();
        var children = attr.value.expression.children.map(convertJSXElement).filter(Boolean);
        var args = [type, props].concat(children.length > 0 ? [t.arrayExpression(children)] : []);
        return t.objectProperty(t.identifier('children'), t.callExpression(t.identifier('__createElement'), args));
      } else {
        if (t.isStringLiteral(attr.value.expression)) {
          return t.objectProperty(t.identifier(attr.name.name), attr.value.expression);
        } else {
          return t.objectProperty(t.identifier(attr.name.name), attr.value.expression);
        }
      }
    } else {
      return t.objectProperty(t.stringLiteral(attr.name.name), attr.value || t.booleanLiteral(true));
    }
  }
  function convertAttributes(attrs) {
    var props = attrs.map(convertAttribute);
    return t.objectExpression(props);
  }
  function convertJSXElement(node) {
    // Para manejar fragmentos, verifica si el nodo es un fragmento de JSX
    if (t.isJSXFragment(node)) {
      var children = node.children.map(convertJSXElement).filter(Boolean);
      return t.arrayExpression(children);
    }

    // Agregar este caso para manejar nodos de texto
    if (t.isJSXText(node)) {
      var content = node.value.trim();
      if (content !== '') {
        return t.objectExpression([t.objectProperty(t.stringLiteral('type'), t.stringLiteral('text')), t.objectProperty(t.stringLiteral('content'), t.stringLiteral(content))]);
      } else {
        return null;
      }
    }

    // Agregar este caso para manejar componentes personalizados
    if (t.isJSXElement(node) && node.openingElement.name.type === 'JSXIdentifier') {
      var type = t.stringLiteral(node.openingElement.name.name);
      var props = node.openingElement.attributes.length ? convertAttributes(node.openingElement.attributes) : t.nullLiteral();
      var _children = node.children.map(convertJSXElement).filter(Boolean);
      var args = [type, props].concat(_children.length > 0 ? [t.arrayExpression(_children)] : []);
      return t.callExpression(t.identifier('__createElement'), args);
    }

    // Agregar este caso adicional para manejar componentes personalizados con nombres calificados (namespace)
    if (t.isJSXElement(node) && node.openingElement.name.type === 'JSXNamespacedName') {
      var _type = t.stringLiteral(node.openingElement.name.namespace.name + ':' + node.openingElement.name.name.name);
      var _props = node.openingElement.attributes.length ? convertAttributes(node.openingElement.attributes) : t.nullLiteral();
      var _children2 = node.children.map(convertJSXElement).filter(Boolean);
      var _args = [_type, _props].concat(_children2.length > 0 ? [t.arrayExpression(_children2)] : []);
      return t.callExpression(t.identifier('__createElement'), _args);
    }
  }
  return {
    visitor: {
      JSXElement: function JSXElement(path) {
        path.replaceWith(convertJSXElement(path.node));
      },
      // Agrega un visitante adicional para manejar fragmentos de JSX
      JSXFragment: function JSXFragment(path) {
        path.replaceWith(convertJSXElement(path.node));
      }
    }
  };
}

export { transformMemmanJsx as default };
