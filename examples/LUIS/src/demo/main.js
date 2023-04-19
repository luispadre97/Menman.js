// main.js
import { loadComponentOnDemand } from '../../../../library/src/utils/lazy-loading'
import { renderTimeComponent } from './component';

// Agregar un contenedor para el componente en tu HTML
const container = document.createElement('div');
container.id = 'timeContainer';
document.body.appendChild(container);

// Cargar y renderizar el componente de forma dinámica
loadComponentOnDemand(renderTimeComponent, 'timeContainer')
    .then(() => console.log('Componente renderizado exitosamente'))
    .catch((error) => console.error('Error al renderizar el componente:', error));
