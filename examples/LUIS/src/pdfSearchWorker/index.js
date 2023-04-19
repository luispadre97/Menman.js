import createWebWorkersLibrary from './../../../../library/src/core/web-worker/index.js'


const workerUrl = 'src/pdfSearchWorker/work.js';

const webWorkersLib = createWebWorkersLibrary(workerUrl);

// Ejemplo de documentos PDF y texto a buscar
const pdfUrls = [
    'src/pdfSearchWorker/Interface_Circuits_for_Microsensor_Integrated_Systems.pdf'
//   'path/to/your/pdf1.pdf',
//   'path/to/your/pdf2.pdf',
//   'path/to/your/pdf3.pdf',
];
const searchText = 'example';

// Función para buscar un texto en los documentos PDF utilizando Web Workers
const searchInPdfDocuments = async (pdfUrls, searchText) => {
  const searchResults = await webWorkersLib.runTask({ pdfUrls, searchText });

  searchResults.forEach((documentResult, index) => {
    const { documentIndex, results } = documentResult;
    console.log(`Resultados en el documento ${pdfUrls[documentIndex]}:`);

    if (results.length === 0) {
      console.log('No se encontraron resultados.');
    } else {
      results.forEach((result) => {
        console.log(`Texto encontrado en la página ${result.pageIndex} en el índice ${result.searchIndex}.`);
      });
    }
  });
};

// Ejemplo de búsqueda
searchInPdfDocuments(pdfUrls, searchText);
