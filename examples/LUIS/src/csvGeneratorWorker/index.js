import createWebWorkersLibrary from './../../../../library/src/core/web-worker/index.js'


// Crear una instancia de la biblioteca con la URL del worker
const workerUrl = 'src/csvGeneratorWorker/work.js';

const webWorkersLib = createWebWorkersLibrary(workerUrl);

// Datos de ejemplo para el informe
const exampleData = [
  { id: 1, name: "Alice", age: 30 },
  { id: 2, name: "Bob", age: 35 },
  { id: 3, name: "Charlie", age: 25 },
];

// Generar y descargar el informe CSV
async function generateAndDownloadCsvReport(data) {
  const csvContent = await webWorkersLib.runTask({ data });
  const csvBlob = new Blob([csvContent], { type: "text/csv" });
  const csvUrl = URL.createObjectURL(csvBlob);

  const link = document.createElement("a");
  link.href = csvUrl;
  link.download = "report.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Ejecuta la función para generar y descargar el informe
generateAndDownloadCsvReport(exampleData);
