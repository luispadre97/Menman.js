import { createApp, reactive, watch } from "../../../library/src/core";

console.log("?")

// Componente Counter
const Counter = ({ context }) => {
    const person = reactive({ name: "John", age: 25 });

    const unwatch = watch(person, "age", (newValue, oldValue) => {
        console.log(`La edad ha cambiado de ${oldValue} a ${newValue}.`);
    });

    person.state.age = 26; // La edad ha cambiado de 25 a 26.
    person.state.age = 27; // La edad ha cambiado de 26 a 27.

    unwatch(); // Detiene la observación de la propiedad "age".
    person.state.age = 28
    console.log(person.state.age)
    return (
        <div>Hol {person.state.age}</div>
    )
};

// Crear una instancia de la aplicación con el componente Counter y una dependencia 'count'
const app = createApp(Counter, {
});

// Montar la aplicación en un elemento del DOM con el selector #app
app.mount("#app");