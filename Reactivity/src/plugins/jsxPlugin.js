export default function transformMemmanJsx({ types: t }, { createElementFunction = '__createElement' } = {}) {
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
    // Para manejar fragmentos, verifica si el nodo es un fragmento de JSX
    if (t.isJSXFragment(node)) {
      const children = node.children.map(convertNode).filter(Boolean);
      return t.arrayExpression(children);
    }

    // Agregar este caso para manejar nodos de texto
    if (t.isJSXText(node)) {
      const content = node.value.trim();
      if (content !== '') {
        return t.stringLiteral(content);
      } else {
        return null;
      }
    }

    // Agregar este caso para manejar componentes personalizados y etiquetas
    if (t.isJSXElement(node)) {
      const isCustomComponent = /^[A-Z]/.test(node.openingElement.name.name);
      const type = isCustomComponent
        ? t.identifier(node.openingElement.name.name)
        : t.stringLiteral(node.openingElement.name.name);
      const props = node.openingElement.attributes.length
        ? convertAttributes(node.openingElement.attributes)
        : t.nullLiteral();
      const children = node.children.map(convertNode).filter(Boolean);

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
      JSXExpressionContainer(path) {
        if (path.parentPath.isJSXText()) {
          path.replaceWith(t.stringLiteral(`$\{${path.node.expression}}`));
        }
      },
      // VariableDeclaration(path) {
      //   // Detecta la declaración de una variable que representa un componente de renderización múltiple
      //   const isMultiRenderComponent =
      //     t.isIdentifier(path.node.declarations[0].id) &&
      //     t.isObjectExpression(path.node.declarations[0].init) &&
      //     path.node.declarations[0].init.properties.some(
      //       (prop) =>
      //         t.isObjectProperty(prop) &&
      //         t.isStringLiteral(prop.key, { value: "type" }) &&
      //         t.isStringLiteral(prop.value, { value: "multiRenderComponent" })
      //     );
      //   if (isMultiRenderComponent) {
      //     const name = path.node.declarations[0].id.name;
      //     const elements = path.node.declarations[0].init.properties.filter(
      //       (prop) => t.isObjectProperty(prop) && t.isStringLiteral(prop.key, { value: "elements" })
      //     );

      //     if (elements.length === 0) {
      //       throw path.buildCodeFrameError(
      //         `The multi-render component '${name}' must have an 'elements' property with an array of elements to render.`
      //       );
      //     }

      //     // Genera código para crear una función que renderiza los elementos
      //     const renderFunction = t.arrowFunctionExpression(
      //       [],
      //       t.arrayExpression(
      //         elements[0].value.elements.map((element) => {
      //           if (t.isIdentifier(element)) {
      //             // Si el elemento es un identificador, lo tratamos como una referencia a otro componente de renderización múltiple
      //             return t.callExpression(t.identifier(element.name), []);
      //           } else {
      //             return convertNode(element);
      //           }
      //         })
      //       )
      //     );

      //     // Genera código para la declaración de la variable que representa al componente de renderización múltiple
      //     const componentDeclaration = t.variableDeclaration("const", [
      //       t.variableDeclarator(t.identifier(name), renderFunction),
      //     ]);

      //     // Reemplaza la declaración original con la declaración de la variable que representa al componente de renderización múltiple
      //     path.replaceWith(componentDeclaration);
      //   }
      // },
      // Agrega la opción `jsx` que indica la extensión que se debe usar para el análisis de importaciones.
    // Si la extensión es `.js`, también cambia la extensión de archivo en la identificación del archivo para que coincida.
    // Esto permitirá que Vite analice correctamente el contenido del archivo para el análisis de importaciones.
    inherits: jsx === 'js' ? require('babel-plugin-syntax-jsx') : undefined,
    manipulateOptions(opts, parserOpts) {
      if (jsx === 'js') {
        parserOpts.plugins.push('jsx');
        opts.generatorOpts.jsExtensions.push('.js');
      }
    },
    }
  }
}