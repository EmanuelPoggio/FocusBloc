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
        return hostname;
    } catch (error){
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

function convertMsToMinSec(milliseconds) {
    let totalSeconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    return `${minutes} min ${seconds} sec`;
}

chrome.tabs.onActivated.addListener(activeInfo => {
    let tabId = activeInfo.tabId;
    chrome.tabs.get(tabId, (tab) => {
        if (!tabTimes[tabId]) {
            tabTimes[tabId] = {
                startTime: Date.now(),
                url: tab.url
            };
        } else {
            tabTimes[tabId].startTime = Date.now();
        }
        Object.keys(tabTimes).forEach((id) => {
            if (parseInt(id) !== tabId && tabTimes[id].url !== '') {
                let duration = Date.now() - tabTimes[id].startTime;
                updateTotalTime(tabTimes[id].url, duration);
                tabTimes[id].startTime = Date.now();
            }
        });
    });
});

chrome.tabs.onRemoved.addListener(tabId => {
    if (tabTimes[tabId] && tabTimes[tabId].url) {
        let duration = Date.now() - tabTimes[tabId].startTime;
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
    });
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

function storeMessagesSequentially(messages) {
    if (messages.length === 0) return;
    let message = messages.shift();
    chrome.storage.local.get('customMessages', function(data) {
        var customMessages = data.customMessages || [];
        if (!customMessages.includes(message)) {
            customMessages.push(message);
            chrome.storage.local.set({ customMessages: customMessages }, function() {
                console.log('Mensajes almacenados:', customMessages);
                storeMessagesSequentially(messages); // Store the next message
            });
        } else {
            storeMessagesSequentially(messages); // Skip to the next message
        }
    });
}

// Agregar nuevas frases secuencialmente
storeMessagesSequentially([
 "El tiempo es lo más valioso que una persona puede gastar.",

"La forma en que gastas tu tiempo es más importante que la cantidad de tiempo que tienes.– Alan Lakein",


"El que pospone el momento adecuado para mejorar su vida, es como el granjero que espera el río para cruzar.– Horace",


"El tiempo perdido nunca se encuentra de nuevo.– Benjamin Franklin",


"La procrastinación es el ladrón del tiempo, año tras año lo dice, hasta que todas sus disculpas se agoten.– Charles Dickens",
]);

// Almacenamiento de URLS
function addUrl(url, sendResponse) {
    chrome.storage.local.get('urlList', function(data) {
        let urlList = data.urlList || [];
        urlList.push(url);
        chrome.storage.local.set({ urlList: urlList }, function() {
            console.log('URL almacenada:', url);
            sendResponse({ success: true, urlList: urlList });
        });
    });
}

function getUrlList(sendResponse) {
    chrome.storage.local.get('urlList', function(data) {
        sendResponse({ urlList: data.urlList || [] });
    });
}


function getBlockedUrls(callback) {
    chrome.storage.local.get('urlList', function(data) {
        let urlList = data.urlList || [];
        callback(urlList);
    });
}
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.url) {
        getBlockedUrls(function(blockedUrls) {
            blockedUrls.forEach(blockedUrl => {
                if (changeInfo.url.includes(blockedUrl)) {
                    chrome.tabs.remove(tabId);
                }
            });
        });
    }
});

function closeTabsWithBlockedUrl(url) {
    chrome.tabs.query({}, function(tabs) {
        tabs.forEach(tab => {
            if (tab.url.includes(url)) {
                chrome.tabs.remove(tab.id);
            }
        });
    });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.command === 'block-url') {
        toggleUrlBlock(message.url);
        closeTabsWithBlockedUrl(message.url); // Llama a la función para cerrar pestañas con la URL bloqueada
    }
});