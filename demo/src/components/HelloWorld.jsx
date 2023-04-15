import { createMemmaLive } from "../../../memman.js/dist/bundle";

const HelloWorld = (props) => {
  const { useLiveState, useLiveEffect } = createMemmaLive();

  const [state, setState] = useLiveState({ count: 0 });

  function handleClick() {
    setState({ count: state.count + 1 });
  }

  useLiveEffect(() => {
    console.log(`Current count: ${state.count}`);
      let intervalId;
        intervalId = setInterval(() => {
          setState({ count: state.count + 1 });
        }, 1000);
      return () => clearInterval(intervalId);
  }, ['count']);

  return (
    <div>
      Count: `Current count: ${state.count}`
      <button onClick={handleClick}>Increment</button>
    </div>
  );
  
};

export default HelloWorld;







