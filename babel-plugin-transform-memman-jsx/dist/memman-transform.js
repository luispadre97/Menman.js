function transformMemmanJsx(_ref) {
  var t = _ref.types;
  var componentPropTypes = {};
  var FUNCTIONAL_COMPONENT = Symbol("FunctionalComponent");

  // Agregar esta función al plugin
  function validateProps(componentName, propTypes, props) {
    for (var key in propTypes) {
      var validator = propTypes[key];
      var propValue = props[key];
      if (!validator(propValue)) {
        throw new Error("Prop validation failed for component '".concat(componentName, "': Property '").concat(key, "' has an invalid value."));
      }
    }
  }
  function convertAttributes(attrs) {
    var spreadProps = null;
    var props = attrs.filter(function (attr) {
      if (t.isJSXAttribute(attr) && attr.name.name === "spreadProps") {
        spreadProps = attr.value.expression;
        return false;
      }
      return true;
    }).map(function (attr) {
      if (t.isJSXSpreadAttribute(attr)) {
        return t.spreadElement(attr.argument);
      } else if (t.isJSXNamespacedName(attr.name)) {
        return t.objectProperty(t.stringLiteral(attr.name.namespace.name + ":" + attr.name.name.name), attr.value);
      } else if (t.isJSXExpressionContainer(attr.value)) {
        if (t.isJSXElement(attr.value.expression) || t.isJSXFragment(attr.value.expression)) {
          var convertedNode = convertNode(attr.value.expression);
          return t.objectProperty(t.identifier(attr.name.name), convertedNode);
        } else {
          return t.objectProperty(t.identifier(attr.name.name), attr.value.expression);
        }
      } else {
        return t.objectProperty(t.stringLiteral(attr.name.name), attr.value || t.booleanLiteral(true));
      }
    });
    if (spreadProps) {
      props.unshift(t.spreadElement(spreadProps));
    }
    return t.objectExpression(props.filter(Boolean).length > 0 ? props : [t.nullLiteral()]);
  }
  function convertNode(node) {
    if (t.isJSXText(node)) {
      var content = node.value.trim();
      if (content !== "") {
        return t.objectExpression([t.objectProperty(t.stringLiteral("type"), t.stringLiteral("text")), t.objectProperty(t.stringLiteral("content"), t.stringLiteral(content))]);
      } else {
        return null;
      }
    } else if (t.isJSXElement(node) || t.isJSXFragment(node)) {
      return convertJSXElement(node);
    } else if (t.isJSXExpressionContainer(node)) {
      if (t.isJSXEmptyExpression(node.expression)) {
        return null;
      } else {
        var expression = node.expression;
        if (t.isFunction(expression) || t.isCallExpression(expression)) {
          return t.arrowFunctionExpression([], expression);
        } else {
          // Envuelve la expresión en un IIFE para que se ejecute como JavaScript en tiempo de ejecución
          return t.callExpression(t.arrowFunctionExpression([], expression), []);
        }
      }
    } else if (t.isIdentifier(node)) {
      if (node[FUNCTIONAL_COMPONENT]) {
        return node[FUNCTIONAL_COMPONENT];
      }
      // Si el nodo es un identificador, lo tratamos como una referencia a un componente de renderización múltiple
      return t.objectExpression([t.objectProperty(t.stringLiteral("type"), t.stringLiteral("multiRenderComponent")), t.objectProperty(t.stringLiteral("component"), node)]);
    } else {
      return null;
    }
  }
  function convertJSXElement(node) {
    if (t.isJSXFragment(node)) {
      var children = node.children.map(convertNode).filter(Boolean);
      return t.arrayExpression(children);
    } else if (t.isJSXElement(node)) {
      var isCustomComponent = node.openingElement.name.type === "JSXIdentifier" && /^[A-Z]/.test(node.openingElement.name.name);
      var type = isCustomComponent ? t.identifier(node.openingElement.name.name) : t.stringLiteral(node.openingElement.name.name);
      var props = node.openingElement.attributes.length ? convertAttributes(node.openingElement.attributes) : t.nullLiteral();
      var _children = node.children.map(convertNode).filter(Boolean);
      var args = [type, props].concat(_children.length > 0 ? _children : []);
      if (isCustomComponent) {
        // Si es un componente personalizado (funcional), valida las props
        var propTypes = componentPropTypes[node.openingElement.name.name];
        if (propTypes) {
          validateProps(node.openingElement.name.name, propTypes, props);
        }
        // Llama al componente funcional directamente en lugar de usar __createElement
        return t.callExpression(type, args);
      } else {
        // Caso contrario, sigue utilizando __createElement
        if (node.openingElement.selfClosing) {
          return t.callExpression(t.identifier("__createElement"), args);
        } else {
          return t.callExpression(t.identifier("__createElement"), args.concat([]));
        }
      }
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
      },
      VariableDeclaration: function VariableDeclaration(path) {
        // Detecta la declaración de una variable que representa un componente de renderización múltiple
        var isMultiRenderComponent = t.isIdentifier(path.node.declarations[0].id) && t.isObjectExpression(path.node.declarations[0].init) && path.node.declarations[0].init.properties.some(function (prop) {
          return t.isObjectProperty(prop) && t.isStringLiteral(prop.key, {
            value: "type"
          }) && t.isStringLiteral(prop.value, {
            value: "multiRenderComponent"
          });
        });
        if (isMultiRenderComponent) {
          var name = path.node.declarations[0].id.name;
          var elements = path.node.declarations[0].init.properties.filter(function (prop) {
            return t.isObjectProperty(prop) && t.isStringLiteral(prop.key, {
              value: "elements"
            });
          });
          if (elements.length === 0) {
            throw path.buildCodeFrameError("The multi-render component '".concat(name, "' must have an 'elements' property with an array of elements to render."));
          }

          // Genera código para crear una función que renderiza los elementos
          var renderFunction = t.arrowFunctionExpression([], t.arrayExpression(elements[0].value.elements.map(function (element) {
            if (t.isIdentifier(element)) {
              // Si el elemento es un identificador, lo tratamos como una referencia a otro componente de renderización múltiple
              return t.callExpression(t.identifier(element.name), []);
            } else {
              return convertNode(element);
            }
          })));

          // Genera código para la declaración de la variable que representa al componente de renderización múltiple
          var componentDeclaration = t.variableDeclaration("const", [t.variableDeclarator(t.identifier(name), renderFunction)]);

          // Reemplaza la declaración original con la declaración de la variable que representa al componente de renderización múltiple
          path.replaceWith(componentDeclaration);
        }
      }
    }
  };
}

export { transformMemmanJsx as default };
