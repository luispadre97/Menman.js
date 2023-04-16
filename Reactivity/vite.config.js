import { defineConfig } from 'vite';
import { transformAsync } from '@babel/core';
import transformMemmanJsx from './src/plugins/jsxPlugin';
import syntaxJSX from '@babel/plugin-syntax-jsx';
function vitePluginMemman() {
  return {
    name: 'vite-plugin-memman',
    enforce: 'pre',
    async transform(code, id) {
      if ((id.endsWith('.jsx') || id.endsWith('.jsm') || id.endsWith('.js') && code.includes('memman'))) {
        code = `import { __createElement } from './src/core/createApp';\n` + code;

        const result = await transformAsync(code, {
          plugins: [
            syntaxJSX,
            [
              transformMemmanJsx,
              {
                createElementFunction: '__createElement',
              },
            ],
          ],
        });

        // Reemplaza las llamadas a __createElement por plantillas de cadena
        const replacedCode = result.code.replace(
          /__createElement\(([^)]+)\)/g,
          '`${$1}`'
        );

        return replacedCode;
      }
    },
  };
}


export default defineConfig({
  plugins: [vitePluginMemman()],
});
