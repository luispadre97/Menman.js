importScripts('https://cdn.jsdelivr.net/npm/pdfjs-dist@3.5.141/build/pdf.min.js');

self.onmessage = async (event) => {
  const { pdfUrls, searchText } = event.data;
  const searchResults = await searchInPdfDocuments(pdfUrls, searchText);

  postMessage(searchResults);
};

async function searchInPdfDocuments(pdfUrls, searchText) {
  const pdfDocumentsPromises = pdfUrls.map((url) => loadPdfDocument(url));
  const pdfDocuments = await Promise.all(pdfDocumentsPromises);

  const searchPromises = pdfDocuments.map((pdf, index) => searchInPdf(pdf, searchText, index));
  const searchResults = await Promise.all(searchPromises);

  return searchResults;
}

async function loadPdfDocument(url) {
  const loadingTask = pdfjsLib.getDocument(url);
  const pdf = await loadingTask.promise;
  return pdf;
}

async function searchInPdf(pdf, searchText, index) {
  const numPages = pdf.numPages;
  const pagePromises = [];

  for (let i = 1; i <= numPages; i++) {
    const pagePromise = pdf.getPage(i).then((page) => searchInPage(page, searchText, i));
    pagePromises.push(pagePromise);
  }

  const pagesResults = await Promise.all(pagePromises);
  const results = pagesResults.filter((result) => result !== null);

  return { documentIndex: index, results };
}

async function searchInPage(page, searchText, pageIndex) {
  const textContent = await page.getTextContent();
  const textItems = textContent.items.map((item) => item.str);
  const text = textItems.join(' ');

  const searchIndex = text.toLowerCase().indexOf(searchText.toLowerCase());

  if (searchIndex === -1) {
    return null;
  }

  return { pageIndex, searchIndex };
}
