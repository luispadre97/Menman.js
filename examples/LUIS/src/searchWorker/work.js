self.onmessage = (event) => {
    const { data, searchValue } = event.data;
    const index = searchInData(data, searchValue);
  
    postMessage(index);
  };
  
  function searchInData(data, searchValue) {
    return data.findIndex((item) => item === searchValue);
  }
  