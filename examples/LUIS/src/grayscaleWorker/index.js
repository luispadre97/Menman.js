import createWebWorkersLibrary from './../../../../library/src/core/web-worker/index.js'

// const workerUrl = new URL('.src/grayscaleWorker/worker.js', import.meta.url).href;
// const worker = new Worker('/src/changeDetectionWorker.js');
const workerUrl = 'src/grayscaleWorker/worker.js';
const webWorkersLib = createWebWorkersLibrary(workerUrl);

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Cargar y dibujar una imagen en el canvas
const image = new Image();
image.src = '/src/grayscaleWorker/4.png';
image.onload = () => {
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
};

// Aplicar el filtro de escala de grises a la imagen en el canvas
const applyGrayscaleFilter = async () => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const grayscaleImageData = await webWorkersLib.runTask(imageData);
  ctx.putImageData(grayscaleImageData, 0, 0);
};

document.getElementById('applyGrayscale').addEventListener('click', applyGrayscaleFilter);
