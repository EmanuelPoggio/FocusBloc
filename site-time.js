// site-time.js
document.addEventListener('DOMContentLoaded', function() {
    fetchSiteTimes();  // Carga y muestra los tiempos por sitio
});
function fetchSiteTimes() {
    chrome.storage.local.get(['totalTimePerSite'], function(result) {
        let siteTimes = result.totalTimePerSite || {};
        displaySiteTimes(siteTimes);
    });
}
function displaySiteTimes(siteTimes) {
    let listContainer = document.getElementById('site-time-list');
    listContainer.innerHTML = '';
    for (let site in siteTimes) {
        let timeSpent = convertMsToMinSec(siteTimes[site]);
        let listItem = document.createElement('div');
        listItem.textContent = `${site}: ${timeSpent}`;
        listContainer.appendChild(listItem);
    }
}
function convertMsToMinSec(milliseconds) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    return `${minutes} min ${seconds} sec`;
}
