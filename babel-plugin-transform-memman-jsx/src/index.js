// export default function transformMemmanJsx({ types: t }) {
//   function convertAttribute(attr) {
//     if (t.isJSXSpreadAttribute(attr)) {
//       return t.spreadElement(attr.argument);
//     } else if (t.isJSXNamespacedName(attr.name)) {
//       return t.objectProperty(
//         t.stringLiteral(attr.name.namespace.name + ":" + attr.name.name.name),
//         attr.value
//       );
//     } else if (t.isJSXExpressionContainer(attr.value)) {
//       const expression = attr.value.expression;
//       if (t.isJSXElement(expression) || t.isJSXFragment(expression)) {
//         const convertedNode = convertNode(expression);
//         return t.objectProperty(t.identifier(attr.name.name), convertedNode);
//       } else {
//         return t.objectProperty(
//           t.identifier(attr.name.name),
//           t.arrowFunctionExpression([], expression)
//         );
//       }
//     } else {
//       return t.objectProperty(
//         t.stringLiteral(attr.name.name),
//         attr.value || t.booleanLiteral(true)
//       );
//     }
//   }


//   function convertAttributes(attrs) {
//     const props = attrs.map((attr) => {
//       if (t.isJSXSpreadAttribute(attr)) {
//         return t.spreadElement(attr.argument);
//       } else if (t.isJSXNamespacedName(attr.name)) {
//         return t.objectProperty(
//           t.stringLiteral(attr.name.namespace.name + ":" + attr.name.name.name),
//           attr.value
//         );
//       } else if (t.isJSXExpressionContainer(attr.value)) {
//         if (
//           t.isJSXElement(attr.value.expression) ||
//           t.isJSXFragment(attr.value.expression)
//         ) {
//           const convertedNode = convertNode(attr.value.expression);
//           return t.objectProperty(t.identifier(attr.name.name), convertedNode);
//         } else {
//           return t.objectProperty(t.identifier(attr.name.name), attr.value.expression);
//         }
//       } else {
//         return t.objectProperty(
//           t.stringLiteral(attr.name.name),
//           attr.value || t.booleanLiteral(true)
//         );
//       }
//     });

//     return t.objectExpression(props.filter(Boolean).length > 0 ? props : [t.nullLiteral()]);
//   }

//   function convertNode(node) {
//     if (t.isJSXText(node)) {
//       const content = node.value.trim();
//       if (content !== "") {
//         return t.objectExpression([
//           t.objectProperty(t.stringLiteral("type"), t.stringLiteral("text")),
//           t.objectProperty(t.stringLiteral("content"), t.stringLiteral(content)),
//         ]);
//       } else {
//         return null;
//       }
//     } else if (t.isJSXElement(node) || t.isJSXFragment(node)) {
//       return convertJSXElement(node);
//     } else if (t.isJSXExpressionContainer(node)) {
//       if (t.isJSXEmptyExpression(node.expression)) {
//         return null;
//       } else {
//         const expression = node.expression;
//         if (t.isFunction(expression) || t.isCallExpression(expression)) {
//           return t.arrowFunctionExpression([], expression);
//         } else {
//           // Envuelve la expresión en un IIFE para que se ejecute como JavaScript en tiempo de ejecución
//           return t.callExpression(
//             t.arrowFunctionExpression([], expression),
//             []
//           );
//         }
//       }
//     } else {
//       return null;
//     }
//   }



//   function convertJSXElement(node) {
//     if (t.isJSXFragment(node)) {
//       const children = node.children.map(convertNode).filter(Boolean);
//       return t.arrayExpression(children);
//     }

//     if (t.isJSXElement(node)) {
//       const type = t.stringLiteral(node.openingElement.name.name);
//       const props = node.openingElement.attributes.length
//         ? convertAttributes(node.openingElement.attributes)
//         : t.nullLiteral();
//       const children = node.children.map(convertNode).filter(Boolean);

//       const args = [type, props].concat(children.length > 0 ? [t.arrayExpression(children)] : []);

//       return t.callExpression(t.identifier("__createElement"), args);
//     }
//   }


//   return {
//     visitor: {
//       JSXElement(path) {
//         path.replaceWith(convertJSXElement(path.node));
//       },
//       // Agrega un visitante adicional para manejar fragmentos de JSX
//       JSXFragment(path) {
//         path.replaceWith(convertJSXElement(path.node));
//       },
//     },
//   };
// }

export default function transformMemmanJsx({ types: t }) {
  function convertAttribute(attr) {
    if (t.isJSXSpreadAttribute(attr)) {
      return t.spreadElement(attr.argument);
    } else if (t.isJSXNamespacedName(attr.name)) {
      return t.objectProperty(
        t.stringLiteral(attr.name.namespace.name + ":" + attr.name.name.name),
        attr.value
      );
    } else if (t.isJSXExpressionContainer(attr.value)) {
      const expression = attr.value.expression;
      if (t.isJSXElement(expression) || t.isJSXFragment(expression)) {
        const convertedNode = convertNode(expression);
        return t.objectProperty(t.identifier(attr.name.name), convertedNode);
      } else {
        return t.objectProperty(
          t.identifier(attr.name.name),
          t.arrowFunctionExpression([], expression)
        );
      }
    } else {
      return t.objectProperty(
        t.stringLiteral(attr.name.name),
        attr.value || t.booleanLiteral(true)
      );
    }
  }

  function convertAttributes(attrs) {
    const props = attrs.map((attr) => {
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

    return t.objectExpression(props.filter(Boolean).length > 0 ? props : [t.nullLiteral()]);
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
          return t.callExpression(
            t.arrowFunctionExpression([], expression),
            []
          );
        }
      }
    } else {
      return null;
    }
  }

  function convertVueComponent(node) {
    const name = node.name.name;
    const props = node.properties.map((property) => {
      return t.objectProperty(t.stringLiteral(property.key.name), property.value);
    });

    const args = [t.stringLiteral("vue"), t.stringLiteral(name), t.objectExpression(props)];
    return t.callExpression(t.identifier("__createElement"), args);
  }

  function convertJSXElement(node) {
    if (t.isJSXFragment(node)) {
      const children = node.children.map(convertNode).filter(Boolean);
      return t.arrayExpression(children);
    }
    if (t.isJSXElement(node)) {
      const type = t.stringLiteral(node.openingElement.name.name);

      // Si es un componente de Vue, llama a la función correspondiente
      if (node.openingElement.name.type === "JSXIdentifier" && node.openingElement.name.name.endsWith(".vue")) {
        return convertVueComponent(node.openingElement);
      }

      const props = node.openingElement.attributes.length
        ? convertAttributes(node.openingElement.attributes)
        : t.nullLiteral();
      const children = node.children.map(convertNode).filter(Boolean);

      const args = [type, props].concat(children.length > 0 ? [t.arrayExpression(children)] : []);

      return t.callExpression(t.identifier("__createElement"), args);
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