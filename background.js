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

//para bloquear paginas una vez que pasa cierto periodo de tiempo
function checkAndBlockSite(hostname) {
    console.log(`Verificando si se debe bloquear el sitio: ${hostname}`);
    console.log(`Tiempo acumulado en ${hostname}: ${convertMsToMinSec(totalTimePerSite[hostname])}`);

    if (hostname === "www.youtube.com" && totalTimePerSite[hostname] >= 60000) {
        console.log(`Bloqueando ${hostname} porque se excedió el límite de tiempo.`);
        let rule = {
            "id": 1,
            "priority": 1,
            "action": { "type": "block" },
            "condition": { "urlFilter": "||youtube.com", "resourceTypes": ["main_frame"] }
        };

        chrome.declarativeNetRequest.updateDynamicRules({
            addRules: [rule],
            removeRuleIds: [1]
        });
    }else {
        console.log(`No se bloquea ${hostname}. Tiempo actual: ${convertMsToMinSec(totalTimePerSite[hostname])}`);
    }
}

//para convertir los milisegundos a segundos y minutos
function convertMsToMinSec(milliseconds) {
    let totalSeconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    return `${minutes} min ${seconds} sec`;
}






//listener para cuando se esta en la tab
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
            checkAndBlockSite(hostname);
            console.log(`URL: ${tabTimes[id].url} - Duration: ${convertMsToMinSec(duration)} - Total Time: ${convertMsToMinSec(totalTimePerSite[hostname])}`);
            tabTimes[id].startTime = Date.now(); // Reiniciar el contador para la nueva pestaña
        }
    });
});
//listener para cuando se cambia de tab
chrome.tabs.onRemoved.addListener(tabId => {
    if (tabTimes[tabId]) {
        let hostname = getHostName(tabTimes[tabId].url); 
        let duration = Date.now() - tabTimes[tabId].startTime;
        updateTotalTime(tabTimes[tabId].url, duration);
        console.log(`Tab closed. URL: ${tabTimes[tabId].url} - Duration: ${convertMsToMinSec(duration)} - Total Time: ${convertMsToMinSec(totalTimePerSite[hostname])}`);
        checkAndBlockSite(hostname);
        delete tabTimes[tabId];
    }
});
