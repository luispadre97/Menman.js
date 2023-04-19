import createWebWorkersLibrary from './../../../../library/src/core/web-worker/index.js'

const workerUrl = 'src/searchWorker/work.js';

const webWorkersLib = createWebWorkersLibrary(workerUrl);

// Generar una gran cantidad de datos
const data = Array.from({ length: 1_000_000 }, () => Math.floor(Math.random() * 100_000));

// Función para buscar un valor en los datos utilizando Web Workers
const searchValueInData = async (searchValue) => {
  const index = await webWorkersLib.runTask({ data, searchValue });

  if (index === -1) {
    console.log(`El valor ${searchValue} no se encuentra en los datos.`);
  } else {
    console.log(`El valor ${searchValue} se encuentra en el índice ${index}.`);
  }
};

// Ejemplo de búsqueda
searchValueInData(12345);
