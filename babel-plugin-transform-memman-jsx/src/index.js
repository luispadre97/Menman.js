export default function transformMemmanJsx({ types: t }) {
  const componentPropTypes = {};
  const FUNCTIONAL_COMPONENT = Symbol("FunctionalComponent");

  
  // Agregar esta función al plugin
  function validateProps(componentName, propTypes, props) {
    for (const key in propTypes) {
      const validator = propTypes[key];
      const propValue = props[key];

      if (!validator(propValue)) {
        throw new Error(
          `Prop validation failed for component '${componentName}': Property '${key}' has an invalid value.`
        );
      }
    }
  }
  function convertAttributes(attrs) {
    let spreadProps = null;
  
    const props = attrs
      .filter((attr) => {
        if (t.isJSXAttribute(attr) && attr.name.name === "spreadProps") {
          spreadProps = attr.value.expression;
          return false;
        }
        return true;
      })
      .map((attr) => {
        if (t.isJSXSpreadAttribute(attr)) {
          return t.spreadElement(attr.argument);
        } else if (t.isJSXNamespacedName(attr.name)) {
          return t.objectProperty(
            t.stringLiteral(attr.name.namespace.name + ":" + attr.name.name.name),
            attr.value
          );
        } else if (t.isJSXExpressionContainer(attr.value)) {
          if (
            t.isJSXElement(attr.value.expression) ||
            t.isJSXFragment(attr.value.expression)
          ) {
            const convertedNode = convertNode(attr.value.expression);
            return t.objectProperty(t.identifier(attr.name.name), convertedNode);
          } else {
            return t.objectProperty(t.identifier(attr.name.name), attr.value.expression);
          }
        } else {
          return t.objectProperty(
            t.stringLiteral(attr.name.name),
            attr.value || t.booleanLiteral(true)
          );
        }
      });
  
    if (spreadProps) {
      props.unshift(t.spreadElement(spreadProps));
    }
  
    return t.objectExpression(
      props.filter(Boolean).length > 0 ? props : [t.nullLiteral()]
    );
  }
  

  function convertNode(node) {
    if (t.isJSXText(node)) {
      const content = node.value.trim();
      if (content !== "") {
        return t.objectExpression([
          t.objectProperty(t.stringLiteral("type"), t.stringLiteral("text")),
          t.objectProperty(t.stringLiteral("content"), t.stringLiteral(content)),
        ]);
      } else {
        return null;
      }
    } else if (t.isJSXElement(node) || t.isJSXFragment(node)) {
      return convertJSXElement(node);
    } else if (t.isJSXExpressionContainer(node)) {
      if (t.isJSXEmptyExpression(node.expression)) {
        return null;
      } else {
        const expression = node.expression;
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
      return t.objectExpression([
        t.objectProperty(t.stringLiteral("type"), t.stringLiteral("multiRenderComponent")),
        t.objectProperty(t.stringLiteral("component"), node),
      ]);
    } else {
      return null;
    }
  }

  function convertJSXElement(node) {
    if (t.isJSXFragment(node)) {
      const children = node.children.map(convertNode).filter(Boolean);
      return t.arrayExpression(children);
    } else if (t.isJSXElement(node)) {
      const isCustomComponent =
        node.openingElement.name.type === "JSXIdentifier" &&
        /^[A-Z]/.test(node.openingElement.name.name);
      const type = isCustomComponent
        ? t.identifier(node.openingElement.name.name)
        : t.stringLiteral(node.openingElement.name.name);

      const props = node.openingElement.attributes.length
        ? convertAttributes(node.openingElement.attributes)
        : t.nullLiteral();
      const children = node.children.map(convertNode).filter(Boolean);
      const args = [type, props].concat(children.length > 0 ? children : []);

      if (isCustomComponent) {
        // Si es un componente personalizado (funcional), valida las props
        const propTypes = componentPropTypes[node.openingElement.name.name];
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
      JSXElement(path) {
        path.replaceWith(convertJSXElement(path.node));
      },
      // Agrega un visitante adicional para manejar fragmentos de JSX
      JSXFragment(path) {
        path.replaceWith(convertJSXElement(path.node));
      },
      VariableDeclaration(path) {
        // Detecta la declaración de una variable que representa un componente de renderización múltiple
        const isMultiRenderComponent =
          t.isIdentifier(path.node.declarations[0].id) &&
          t.isObjectExpression(path.node.declarations[0].init) &&
          path.node.declarations[0].init.properties.some(
            (prop) =>
              t.isObjectProperty(prop) &&
              t.isStringLiteral(prop.key, { value: "type" }) &&
              t.isStringLiteral(prop.value, { value: "multiRenderComponent" })
          );
        if (isMultiRenderComponent) {
          const name = path.node.declarations[0].id.name;
          const elements = path.node.declarations[0].init.properties.filter(
            (prop) => t.isObjectProperty(prop) && t.isStringLiteral(prop.key, { value: "elements" })
          );

          if (elements.length === 0) {
            throw path.buildCodeFrameError(
              `The multi-render component '${name}' must have an 'elements' property with an array of elements to render.`
            );
          }

          // Genera código para crear una función que renderiza los elementos
          const renderFunction = t.arrowFunctionExpression(
            [],
            t.arrayExpression(
              elements[0].value.elements.map((element) => {
                if (t.isIdentifier(element)) {
                  // Si el elemento es un identificador, lo tratamos como una referencia a otro componente de renderización múltiple
                  return t.callExpression(t.identifier(element.name), []);
                } else {
                  return convertNode(element);
                }
              })
            )
          );

          // Genera código para la declaración de la variable que representa al componente de renderización múltiple
          const componentDeclaration = t.variableDeclaration("const", [
            t.variableDeclarator(t.identifier(name), renderFunction),
          ]);

          // Reemplaza la declaración original con la declaración de la variable que representa al componente de renderización múltiple
          path.replaceWith(componentDeclaration);
        }
      },
    },
  };
}