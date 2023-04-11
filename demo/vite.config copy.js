import { defineConfig } from 'vite';
import { transformAsync } from '@babel/core';
import transformMemmanJsx from './../babel-plugin-transform-memman-jsx/dist/memman-transform';
import syntaxJSX from '@babel/plugin-syntax-jsx'; 
// Configuración del plugin
function vitePluginMemman() {
  return {
    name: 'vite-plugin-memman',
    enforce: 'pre',
    async transform(code, id) {
      if (id.endsWith('.jsx') || id.endsWith('.js') && code.includes('memman')) {
        // Inyectar la importación de createElement
        code = `import { createElement as __createElement } from '/../memman.js/dist/bundle';\n` + code;

        const result = await transformAsync(code, {
          plugins: [
            syntaxJSX,
            transformMemmanJsx
          ],
        });

        return result.code;
      }
    },
  };
}

// Configuración de Vite
export default defineConfig({
  plugins: [vitePluginMemman()],
});