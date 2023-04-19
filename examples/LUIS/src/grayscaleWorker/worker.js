self.onmessage = async (event) => {
    const imageData = event.data;
    const grayscaleImageData = convertToGrayscale(imageData);
  
    postMessage(grayscaleImageData, [grayscaleImageData.data.buffer]);
  };
  
  function convertToGrayscale(imageData) {
    const { data } = imageData;
  
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = data[i + 1] = data[i + 2] = avg;
    }
  
    return imageData;
  }
  