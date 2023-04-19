
// import { defineConfig } from 'vite';
// import { transformAsync } from '@babel/core';
// import transformMemmanJsx from './../../babel-plugin/src/index' 
// import syntaxJSX from '@babel/plugin-syntax-jsx';



// // Configuración del plugin
// function vitePluginMemman() {
//   return {
//     name: 'vite-plugin-memman',
//     enforce: 'pre',
//     async transform(code, id) {
//       if (id.endsWith('.jsx') || id.endsWith('.js')) {
//         // Inyectar la importación de createElement
//         code = `import { h as __createElement } from '/src/observadores/main';\n` + code;

        

//         const result = await transformAsync(code, {
//           plugins: [
//             syntaxJSX,
//             transformMemmanJsx
//           ],
//         });

//         return result.code;
//       }
//     },
//   };
// }


// // Configuración de Vite
// export default defineConfig({
//   plugins: [vitePluginMemman()],
// });

import { defineConfig } from 'vite';
import { transformAsync } from '@babel/core';
import transformMemmanJsx from './../../babel-plugin/src/index' 
import syntaxJSX from '@babel/plugin-syntax-jsx';


// Configuración del plugin
function vitePluginMemman() {
  return {
    name: 'vite-plugin-memman',
    enforce: 'pre',
    async transform(code, id) {
      if (id.endsWith('.jsx') || id.endsWith('.js')) {
        // Inyectar la importación de createElement
                code = `import { h as __createElement } from '/src/observadores/main';\n` + code;


        

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