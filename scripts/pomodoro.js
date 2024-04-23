// popup.js
let isPaused = false;

chrome.runtime.onMessage.addListener(function(message) {
    if (message.timeLeft !== undefined) {
        let minutes = Math.floor(message.timeLeft / 60000);
        let seconds = Math.floor((message.timeLeft % 60000) / 1000);
        document.getElementById('timer-display').textContent = `${message.sessionLabel}: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
})
chrome.runtime.onMessage.addListener(function(message) {
    if (message.command === "playSound") {
        document.getElementById('alarm-audio').play();
    }
});
document.addEventListener('DOMContentLoaded',function() {
    chrome.runtime.sendMessage({command: "init"});
});
document.getElementById('start-btn').addEventListener('click', function() {
    if (isPaused){
        chrome.runtime.sendMessage({command: "continue"});
        isPaused = false;
    } else { 
        let workTime = document.getElementById('work-time').value;
        let breakTime = document.getElementById('break-time').value;
        chrome.runtime.sendMessage({command: "start", workTime: workTime, breakTime: breakTime});
    }
});
document.getElementById('pause-btn').addEventListener('click', function() {
    chrome.runtime.sendMessage({command: "pause"});
    isPaused = true;
});
chrome.runtime.onMessage.addListener(function(message) {
    if (message.command === "resetUI") {
        document.getElementById('timer-display').textContent = "Trabajo: 30:00"; 
        document.getElementById('work-time').value = "30"; 
        document.getElementById('break-time').value = "30"; 
    }
});
document.getElementById('reset-btn').addEventListener('click', function() {
    chrome.runtime.sendMessage({command: "reset"});
});
document.getElementById('show-time-btn').addEventListener('click', () => {
    chrome.action.setPopup({popup: 'site-time.html'}, () => {
        window.location.href = 'site-time.html'; 
    });
});