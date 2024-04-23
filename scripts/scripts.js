//Script para ver los datos guardados en totalTimePerSite
chrome.storage.local.get(['totalTimePerSite'], function(result) {
    console.log('Tiempo total por sitio:', result.totalTimePerSite);
  });
//