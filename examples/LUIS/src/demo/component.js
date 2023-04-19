// myComponent.js
export function renderTimeComponent(targetElementId) {
    const currentTime = new Date().toLocaleTimeString();
    return [
        {
            type: 'setHtml',
            selector: `#${targetElementId}`,
            value: `<p>La hora actual es: ${currentTime}</p>`
        }
    ];
}
