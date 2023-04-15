// plugin/src/index.js
export default function transformMemmanJsx({ types: t }) {
    function convertNode(node) {
        if (t.isJSXElement(node)) {
          return convertJSXElement(node);
        } else if (t.isStringLiteral(node)) {
          return t.stringLiteral(node.value);
        } else if (t.isNumericLiteral(node)) {
          return t.numericLiteral(node.value);
        } else if (t.isBooleanLiteral(node)) {
          return t.booleanLiteral(node.value);
        } else if (t.isNullLiteral(node)) {
          return t.nullLiteral();
        } else if (t.isIdentifier(node)) {
          return t.identifier(node.name);
        } else if (t.isBinaryExpression(node)) {
          return t.binaryExpression(node.operator, convertNode(node.left), convertNode(node.right));
        } else if (t.isUnaryExpression(node)) {
          return t.unaryExpression(node.operator, convertNode(node.argument));
        } else if (t.isConditionalExpression(node)) {
          return t.conditionalExpression(
            convertNode(node.test),
            convertNode(node.consequent),
            convertNode(node.alternate)
          );
        } else {
          throw new Error(`Tipo de nodo JSX no válido: ${node.type}`);
        }
      }
      


    function convertJSXElement(node, parentProps = []) {
        let tagName = node.openingElement.name.name;
        let props = [];

        if (t.isJSXMemberExpression(node.openingElement.name)) {
            tagName = node.openingElement.name.object.name + "." + node.openingElement.name.property.name;
        }

        if (node.openingElement.attributes.length > 0) {
            node.openingElement.attributes.forEach((attr) => {
                if (t.isJSXAttribute(attr)) {
                    let propName = attr.name.name;
                    let propValue = convertNode(attr.value);
                    props.push(t.objectProperty(t.stringLiteral(propName), propValue));
                } else if (t.isJSXSpreadAttribute(attr)) {
                    props.push(t.spreadElement(attr.argument));
                } else {
                    throw new Error(`Tipo de atributo JSX no válido: ${attr.type}`);
                }
            });
        }

        const children = node.children.map((child) => {
            if (t.isJSXElement(child) || t.isJSXFragment(child)) {
                return convertJSXElement(child, props);
            } else if (t.isJSXExpressionContainer(child)) {
                return child.expression;
            } else {
                return child;
            }
        });

        if (t.isJSXElement(node) && t.isJSXMemberExpression(node.openingElement.name)) {
            const componentName = node.openingElement.name.object.name;
            const componentProps = props.find((prop) => prop.key.name === "props");

            if (componentProps) {
                props = props.filter((prop) => prop.key.name !== "props");
                props = props.concat(componentProps.value.properties);
            }

            if (componentName in customComponents) {
                const customComponent = customComponents[componentName];
                const requiredProps = customComponent.requiredProps || [];

                requiredProps.forEach((propName) => {
                    if (!props.find((prop) => prop.key.name === propName)) {
                        throw new Error(`La propiedad "${propName}" es requerida en el componente "${componentName}"`);
                    }
                });
            }
        }

        if (t.isJSXElement(node)) {
            const isCustomComponent = t.isJSXMemberExpression(node.openingElement.name) || customComponents[node.openingElement.name.name];

            if (isCustomComponent) {
                const componentProps = props.find((prop) => prop.key.name === "props");
                const newProps = props.filter((prop) => prop.key.name !== "props").concat(parentProps);

                if (componentProps) {
                    newProps.push(t.objectProperty(t.stringLiteral("props"), componentProps.value));
                }

                return t.callExpression(t.identifier("__createElement"), [
                    t.identifier(tagName),
                    t.objectExpression(newProps),
                    ...children,
                ]);
            } else {
                return t.callExpression(t.identifier("__createElement"), [
                    t.stringLiteral(tagName),
                    t.objectExpression(props.concat(parentProps)),
                    ...children,
                ]);
            }
        } else {
            return children;
        }
    }


    return {
        visitor: {
            Program(path) {
                path.node.body.unshift(
                    t.importDeclaration(
                        [t.importSpecifier(t.identifier('__createElement'), t.identifier('createElement'))],
                        t.stringLiteral('./src/index')
                    )
                );
            },
            JSXElement(path) {
                path.replaceWith(convertJSXElement(path.node));
            },
            JSXText(path) {
                path.replaceWith(t.stringLiteral(path.node.value.trim()));
            },
            JSXExpressionContainer(path) {
                path.replaceWith(path.node.expression);
            },
            JSXAttribute(path) {
                const propName = path.node.name.name;
                const propValue = convertNode(path.node.value);
                path.replaceWith(
                    t.objectProperty(t.stringLiteral(propName), propValue)
                );
            },
            JSXSpreadAttribute(path) {
                path.replaceWith(t.spreadElement(path.node.argument));
            },
        },
    };
}
