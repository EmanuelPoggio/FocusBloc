let tabTimes = {};
let totalTimePerSite = {};

//guardamos el host en base a la url
function getHostName(url) {
    try {
        let hostname = new URL(url).hostname;
        console.log(`Hostname extraído: ${hostname}`);
        return hostname;
    } catch (error){
        console.error('Error al obtener el hostname:', error);
        return null;
    }
}
//actualizamos el tiempo total que se va gastando en el host
function updateTotalTime(url, timeSpent) { 
    let hostname = getHostName(url);
    if (hostname){
        if (totalTimePerSite[hostname]) {
            totalTimePerSite[hostname] += timeSpent;
        } else {
            totalTimePerSite[hostname] = timeSpent;
        }
        console.log(`Tiempo actualizado para ${hostname}: ${totalTimePerSite[hostname]} ms`);
    }
    
}
//listener para cuando si hay actividad
chrome.tabs.onActivated.addListener(activeInfo => {
    let tabId = activeInfo.tabId;
    if (!tabTimes[tabId]) {
        tabTimes[tabId] = {
            startTime: Date.now(),
            url: ''
        };
    }

    chrome.tabs.get(tabId, (tab) => {
        tabTimes[tabId].url = tab.url;
    });

    // Registrar el tiempo de la pestaña previamente activa
    Object.keys(tabTimes).forEach((id) => {
        if (parseInt(id) !== tabId && tabTimes[id].url !== '') {
            let duration = Date.now() - tabTimes[id].startTime;
            updateTotalTime(tabTimes[id].url, duration);
            let hostname = getHostName(tabTimes[id].url);
            console.log(`URL: ${tabTimes[id].url} - Duration: ${duration} ms - Total Time: ${totalTimePerSite[hostname]} ms`);
            tabTimes[id].startTime = Date.now(); // Reiniciar el contador para la nueva pestaña
        }
    });
});
//listener para cuando se cambia de tab
chrome.tabs.onRemoved.addListener(tabId => {
    if (tabTimes[tabId]) {
        let duration = Date.now() - tabTimes[tabId].startTime;
        updateTotalTime(tabTimes[tabId].url, duration);
        console.log(`Tab closed. URL: ${tabTimes[tabId].url} - Duration: ${duration} ms - Total TIme: ${totalTimePerSite[tabTimes[id].url]} ms`);
        delete tabTimes[tabId];
    }
});
