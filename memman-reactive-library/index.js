import { ReactiveComponent, createElement, render } from './src/index.js';

class Counter extends ReactiveComponent {
    constructor(props) {
        super(props);
        this.setProp('count', 0);
        this.setProp('name', 'John');
        this.increment = this.increment.bind(this);
        this.decrement = this.decrement.bind(this);

    }

    increment() {
        const count = this.getProp('count') + 1;
        this.setProp('count', count);
    }

    decrement() {
        const count = this.getProp('count') - 1;
        this.setProp('count', count);
    }

    render() {
        const count = this.getProp('count');
        return createElement(
            'div',
            null,
            createElement('button', { onClick: this.increment }, '+'),
            createElement('span', null, count),
            createElement('button', { onClick: this.decrement }, '-')
        );
    }
}

const app = new Counter(); // Crea una instancia del componente Counter
render(app, document.getElementById('app'));

// Añade esto para que el componente se actualice automáticamente cuando el valor de 'count' cambie
app.onPropChange('count', () => {
    app.componentDidUpdate();
});
app.watch('count', (value) => {
    console.log(`'count' ?? ? Esto es un watch =V changed to ${value}`);
});


const SimpleButton = (props) => {
    return (
        <button {...props}>{props.children}</button>
    );
};
