import { render } from './src/index.js';


function HelloWorld() {
    return (<div s="x">xxxx</div>)
}
// function HelloWorld2() {
//     return (<div>xxxx</div>)
// }
const app = new HelloWorld();
render(app, document.getElementById('app'));


// // Añade esto para que el componente se actualice automáticamente cuando el valor de 'count' cambie
// app.onPropChange('count', () => {
//     app.componentDidUpdate();
// });
// app.watch('count', (value) => {
//     console.log(`'count' ?? ? Esto es un watch =V changed to ${value}`);
// });


// const SimpleButton = (props) => {
//     return (
//         <button {...props}>{props.children}</button>
//     );
// };
