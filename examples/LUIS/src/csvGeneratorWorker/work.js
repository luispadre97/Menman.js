self.onmessage = (event) => {
    const { data } = event.data;
    const csvContent = generateCsv(data);
    postMessage(csvContent);
  };
  
  function generateCsv(data) {
    const header = Object.keys(data[0]).join(",") + "\n";
    const rows = data.map((row) => Object.values(row).join(",")).join("\n");
    return header + rows;
  }
  