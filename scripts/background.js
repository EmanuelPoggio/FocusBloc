let tabTimes = {};
let totalTimePerSite = {};
let isPomodoroRunning = false;
let pomodoroTimer = null;
let currentSessionType = 'work';
let WORK_TIME = 30 * 60 * 1000;
let BREAK_TIME = 30 * 60 * 1000;
let remainingTime = 0;
let endTime = 0;

//----------Calculando tiempo por Host--------------

function getHostName(url) {
    try {
        let hostname = new URL(url).hostname;
        //console.log(`Hostname extraído: ${hostname}`);
        return hostname;
    } catch (error){
        //console.error('Error al obtener el hostname:', error);
        return null;
    }
}
function updateTotalTime(url, timeSpent) {
    let hostname = getHostName(url);
    if (hostname) {
        chrome.storage.local.get(['totalTimePerSite'], function(result) {
            let totalTime = result.totalTimePerSite || {};
            totalTime[hostname] = (totalTime[hostname] || 0) + timeSpent;
            chrome.storage.local.set({totalTimePerSite: totalTime}, function() {
                console.log(`Tiempo actualizado para ${hostname}: ${totalTime[hostname]} ms`);
            });
        });
    }
}
/* 
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
} */
function convertMsToMinSec(milliseconds) {
    let totalSeconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    return `${minutes} min ${seconds} sec`;
}
chrome.tabs.onActivated.addListener(activeInfo => {
    let tabId = activeInfo.tabId;
    chrome.tabs.get(tabId,(tab) =>{
        console.log(`Pestaña activada: ID = ${tabId}, URL = ${tab.url}, Tiempo = ${new Date().toLocaleTimeString()}`);
        if (!tabTimes[tabId]) {
            tabTimes[tabId] = {
                startTime: Date.now(),
                url: tab.url
            };
        } else {
            tabTimes[tabId].startTime = Date.now()
        }
        // Registrar el tiempo de la pestaña previamente activa
        Object.keys(tabTimes).forEach((id) => {
            if (parseInt(id) !== tabId && tabTimes[id].url !== '') {
                let duration = Date.now() - tabTimes[id].startTime;
                updateTotalTime(tabTimes[id].url, duration);
                //let hostname = getHostName(tabTimes[id].url);
                //checkAndBlockSite(hostname);
                //console.log(`URL: ${tabTimes[id].url} - Duration: ${convertMsToMinSec(duration)} - Total Time: ${convertMsToMinSec(totalTimePerSite[hostname])}`);
                tabTimes[id].startTime = Date.now(); // Reiniciar el contador para la nueva pestaña
            }
        });
    });
});
chrome.tabs.onRemoved.addListener(tabId => {
    if (tabTimes[tabId] && tabTimes[tabId].url) {
        let duration = Date.now() - tabTimes[tabId].startTime;
        let formattedDuration = convertMsToMinSec(duration);
        console.log(`Tab closed. URL: ${tabTimes[tabId].url} - Duration: ${formattedDuration}`);
        updateTotalTime(tabTimes[tabId].url, duration);
        delete tabTimes[tabId];
    }
});

//---------------POMODORO---------------------------------------

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch (message.command) {
        case 'start':
            if (!isPomodoroRunning) {
                startNewPomodoro(message.workTime, message.breakTime);
            }
            //WORK_TIME = parseInt(message.workTime) * 60 * 1000;
            //BREAK_TIME = parseInt(message.breakTime) * 60 * 1000;
            //startPomodoro();
            break;
        case 'continue':
            if (!isPomodoroRunning && remainingTime > 0){
                continuePomodoro();
            }
            break;
        case 'pause':
            pausePomodoro();
            break;
        case 'reset':
            resetPomodoro();
            break;
        case 'init':
            sendInitialState();
            break;
    }
    if (message.command === 'start') {
        startPomodoro();
    } else if (message.command === 'pause') {
        pausePomodoro();
    } else if (message.command === 'reset') {
        resetPomodoro();
    }
});
function sendInitialState(){
    chrome.storage.local.get('currentSessionType', function(data){
        currentSessionType = data.currentSessionType || 'work';
        updateTimerDisplay(currentSessionType === 'work' ? WORK_TIME : BREAK_TIME);
    });
}
function playSound() {
    chrome.runtime.sendMessage({command: "playSound"});
}
function showNotificationPomodoro(sessionType) {
    let notificationOptions = {
        type: 'basic',
        iconUrl: './images/timer.png',
        title: 'Pomodoro Timer',
        message: sessionType === 'work' ? '¡Tiempo de trabajo completado!' : '¡Descanso completado!',
        priority: 2
    };

    chrome.notifications.create(notificationOptions, function(notificationId) {
        console.log("Notificacion mostrada para " + sessionType);
    }) ;
} 
function updateTimerDisplay(remainingTime){
    let sessionLabel = currentSessionType === 'work' ? 'Trabajo' : 'Descanso';
    chrome.runtime.sendMessage({timeLeft: remainingTime, sessionLabel: sessionLabel});
}
function startPomodoro() {
    if (!isPomodoroRunning) {
        isPomodoroRunning = true;
        chrome.storage.local.get('currentSessionType', function(data) {
            currentSessionType = data.currentSessionType || 'work';
            let startTime = Date.now();
            if (remainingTime <= 0) {
                endTime = startTime + (currentSessionType === 'work' ? WORK_TIME : BREAK_TIME);
            } else {
                endTime = startTime + remainingTime;
            }

            pomodoroTimer = setInterval(() => {
                let now = Date.now();
                remainingTime = endTime - now;
                if (remainingTime < 0) {
                    clearInterval(pomodoroTimer);
                    isPomodoroRunning = false;
                    handlePomodoroTimeout();
                } else {
                    updateTimerDisplay(remainingTime);
                }
            }, 1000);
        });
    }
}
function startNewPomodoro(workTime, breakTime) {
    WORK_TIME = parseInt(workTime) * 60 * 1000;
    BREAK_TIME = parseInt(breakTime) * 60 * 1000;
    startPomodoro();
}
function continuePomodoro(){
    if (!isPomodoroRunning && remainingTime > 0) {
        startPomodoro();
    }
}
function pausePomodoro() {
    if (isPomodoroRunning) {
        clearTimeout(pomodoroTimer);
        isPomodoroRunning = false;
        let now = Date.now();
        remainingTime = endTime - now;
        console.log(`Pomodoro paused`);
    }
}
function resetPomodoro() {
    if (isPomodoroRunning) {
        clearTimeout(pomodoroTimer);
        isPomodoroRunning = false;
        currentSessionType = 'work';
        remainingTime = 0;  
        WORK_TIME = 30 * 60 * 1000;
        REST_TIME = 30 * 60 * 1000;

        chrome.storage.local.set({'currentSessionType': currentSessionType});

        updateTimerDisplay(WORK_TIME);
        console.log(`Pomodoro reseted`);
        chrome.runtime.sendMessage({command: "resetUI"});
    }
}
function handlePomodoroTimeout() {
    currentSessionType = currentSessionType === 'work' ? 'break' : 'work';
    chrome.storage.local.set({'currentSessionType': currentSessionType});
    console.log(currentSessionType === 'work' ? 'Descanso finalizado. Empieza la sesión de trabajo.' : 'Sesión de trabajo finalizada. Empezamos el descanso.');

    playSound();
    showNotificationPomodoro(currentSessionType);
    startPomodoro();
}

function storeMessage(phrase) {
    chrome.storage.local.get({ customMessages: [] }, function(data) {
        var customMessages = data.customMessages || [];
        customMessages.push(phrase);
        chrome.storage.local.set({ customMessages: customMessages });
    });
}

storeMessage("Esta es una frase personalizada 1.");
storeMessage("Esta es una frase personalizada 2.");
storeMessage("Esta es una frase personalizada 3.");
