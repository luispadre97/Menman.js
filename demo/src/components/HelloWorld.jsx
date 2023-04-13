import { memmanCreateSignal, memmanUseEffect, withCurrentComponent } from "../../../memman.js/dist/bundle";

const HelloWorld = withCurrentComponent((props) => {
    const [count, setCount] = memmanCreateSignal(1);

    // console.log(props,'props')
    memmanUseEffect(() => {
        console.log('Componente montado' + count);
        return () => {
            console.log('Componente desmontado');
        };
    }, []);

    function handleIncrement() {
        setCount((prevCount) => {
            return prevCount + 1
        });
    }
    function handleDecrement() {
        setCount((prevCount) => {
            return prevCount - 1
        });
    }
    // console.log(count)
    // const VantButton = props.get('Button');
    return (
        <div><></>
            <p>El valor actual de count es {count}</p>
            <p>El valor actual de count es {` ${count}`}</p>
            <p>{` ${count}`}</p>
            <button style={{ backgroundColor: 'red', color: 'white' }} onClick={handleIncrement}>Incrementar</button>
            <button onClick={handleDecrement}>Decrementar</button>
            <Button1 data="soy"/>
            <Button2 />

        </div>
    );
})


export default HelloWorld;

function Button1(props) {
    const buttonProps = {
        type: "button",
        style: { "backgroundColor": 'red' },
        onClick: () => { console.log("DEMO ") },
    };
    return (
        <div>
            <button spreadProps={buttonProps}>s</button>
            <>Button1</>
        </div>
    )
}

const Button2 = (props) => {
    // console.log(props,'props')
    // const VantButton = props.get('Button');
    return (
        <div>
            <>Button2</>
        </div>
    )
}