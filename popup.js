// popup.js
chrome.runtime.onMessage.addListener(function(message) {
    if (message.timeLeft !== undefined) {
        let minutes = Math.floor(message.timeLeft / 60000);
        let seconds = Math.floor((message.timeLeft % 60000) / 1000);
        let sessionLabel = message.sessionLabel;
        document.getElementById('timer-display').textContent = `${sessionLabel}: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
})
chrome.runtime.onMessage.addListener(function(message) {
    if (message.command === "playSound") {
        document.getElementById('alarm-audio').play();
    }
});
document.getElementById('start-btn').addEventListener('click', function() {
    let workTime = document.getElementById('work-time').value;
    let breakTime = document.getElementById('break-time').value;
    chrome.runtime.sendMessage({command: "start", workTime: workTime, breakTime: breakTime});
});
document.getElementById('pause-btn').addEventListener('click', function() {
    chrome.runtime.sendMessage({command: "pause"});
});
document.getElementById('stop-btn').addEventListener('click', function() {
    chrome.runtime.sendMessage({command: "stop"});
});
