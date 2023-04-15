// plugin/src/index.js
export default function transformMemmanJsx({ types: t }) {
    function convertNode(node) {
        if (node.type === 'JSXElement') {
            return convertJSXElement(node);
        } else if (node.type === 'JSXText') {
            return t.stringLiteral(node.value.trim());
        } else if (node.type === 'JSXExpressionContainer') {
            return node.expression;
        } else if (node.type === 'JSXEmptyExpression') {
            return null; // Manejar JSXEmptyExpression y retornar null
        } else {
            throw new Error(`Tipo de nodo JSX no válido: ${node.type}`);
        }
    }
    const customComponents = {
        MyCustomComponent: { requiredProps: ["prop1", "prop2"] },
        AnotherCustomComponent: { requiredProps: ["prop3"] },
      };
    
      function convertJSXElement(node) {
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
      
          // Si el elemento JSX tiene atributos, agregar la propiedad "props" al objeto de propiedades
          props = [t.objectProperty(t.stringLiteral("props"), t.objectExpression(props))];
        }
      
        let children = node.children.map(convertNode).filter((child) => {
          return t.isStringLiteral(child) ? child.value !== "" : true;
        });
      
        if (children.length > 0) {
          children.forEach((child) => {
            if (t.isJSXElement(child) || t.isJSXFragment(child)) {
              children = children.concat(child.children);
            }
          });
      
          children = children.filter((child) => !t.isJSXElement(child) && !t.isJSXFragment(child));
        }
      
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
            props.push(t.objectProperty(t.stringLiteral("props"), t.objectExpression(props)));
          }
        }
      
        const tagIdentifier = /^[A-Z]/.test(tagName)
          ? t.identifier(tagName)
          : t.stringLiteral(tagName);
      
        const isSelfClosing = !node.children.length && node.closingElement === null;
      
        if (isSelfClosing) {
            return t.callExpression(t.identifier("__createElement"), [
              tagIdentifier,
              t.objectExpression(props),
            ]);
          } else {
            return t.callExpression(t.identifier("__createElement"), [
              tagIdentifier,
              t.objectExpression(props),
              t.arrayExpression(children),
            ]);
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