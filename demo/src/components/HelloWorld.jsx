// // import { createElement as memman } from "../../../memman.js/dist/bundle";


// const HelloWorld = () => {
//     return (
//         <div>
//             <h1>Hello World</h1>
//             <Args data="mundo">Hola</Args>
//         </div>
//     );
// };

// const Args = (props) => {
//     console.log(props);
//     return (
//         <div>
//             {props.data}
//             {props && props}
//         </div>
//     );
// };

// // export default HelloWorld;
// // const HelloWorld = () => {
// //     return memman(
// //         "div",
// //         null,
// //         memman("h1", null, "Hello World")
// //     );
// // };

// export default HelloWorld;
import { createElement, createComponent, useDynamicState } from "../../../memman.js/dist/bundle";

// const HelloWorld = () => {
//     const [count, setCount] = useDynamicState(0);

//     return (
//         <div className="counter">
//             <button onClick={() => setCount(count - 1)}>-</button>
//             <span>{count}</span>
//             <button onClick={() => setCount(count + 1)}>+</button>
//         </div>
//     );
// };

// function HelloWorld(props) {
//     console.log(props, 'props');
//     const [count, setCount] = useDynamicState(0);
//     const VantButton = props.get('Button');
  
//     return (
//       <div>
//         <p>{props.get('message')}</p>
//         <p>Count: {count} DDDDDDDDDDDDDd</p>
//         <VantButton onClick={() => setCount(count + 1)}>Increment</VantButton>
//       </div>
//     );
//   }



// export default HelloWorld;


function HelloWorld(props) {
    console.log(props, 'props');
    const [count, setCount] = useDynamicState(0);

    // Obtener el componente Button de Vant desde las dependencias
    const VantButton = props.get('Button');

    return (
        <div>
            <p>{props.get('message')}</p>
            <p>Count: {count}</p>
            {/* Utilizar el componente Button de Vant */}
            <VantButton className="van-button--info"  onClick={() => setCount(count + 1)}>Increment</VantButton>
            <van-button plain type="primary">Plain</van-button>
            <button style={{background:'#ddd', borderRadius:'12px'}}>DEmo</button>
        </div>
    );
};

export default HelloWorld;