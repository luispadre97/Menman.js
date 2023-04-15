import { defineConfig } from 'vite';
import { transformAsync } from '@babel/core';
import transformMemmanJsx from './plugin/src/index';
import syntaxJSX from '@babel/plugin-syntax-jsx';
// import {createElement} from './src/index'
// Generar la función del plugin
function createVitePluginMemman() {
  return {
    name: 'vite-plugin-memman',
    enforce: 'pre',
    async transform(code, id) {
      if (
        id.endsWith('.jsx') ||
        id.endsWith('.memman') ||
        (id.endsWith('.js') && code.includes('memman'))
      ) {
        // code = `import { ErrorBoundary as __errorBoundary} from '/src/index';\n` + code;

        const result = await transformAsync(code, {
          plugins: [syntaxJSX, transformMemmanJsx],
        });

        return {
          code: result.code,
          map: result.map
        };
      }
    },
  };
}

export default defineConfig({
  plugins: [createVitePluginMemman()],
});
