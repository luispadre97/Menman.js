import { memmanCreateSignal, memmanUseEffect } from "../../../memman.js/dist/bundle";

function HelloWorld(props) {
    const [count, setCount] = memmanCreateSignal(1);

    // memmanUseEffect(() => {
    //     console.log(`El valor de count es ${count},"------------`);
    // }, [count]);

    function handleIncrement() {
        setCount((prevCount) => {
            console.log(prevCount)
            return prevCount + 1
        });
    }
    function handleDecrement() {
        setCount((prevCount) => {
            console.log(prevCount)
            return prevCount- 1
        });
    }
    console.log(count)
    return (
        <div>
            <p>El valor actual de count es {count}</p>
            <p>El valor actual de count es {` ${count}`}</p>
            <p>{` ${count}`}</p>
            <button onClick={handleIncrement}>Incrementar</button>
            <button onClick={handleDecrement}>Decrementar</button>
        </div>
    );
}

export default HelloWorld;