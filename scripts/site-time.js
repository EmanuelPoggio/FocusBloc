// site-time.js
document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(['totalTimePerSite'], function(result) {
        const siteTimes = result.totalTimePerSite || {};
        populateSiteList(siteTimes);
    });
});

function populateSiteList(siteTimes) {
    const siteList = document.getElementById('site-data');
    siteList.innerHTML = '';  // Clear previous entries

    Object.keys(siteTimes).forEach(site => {
        const timeSpent = convertMsToHoursMinutes(siteTimes[site]);
        const row = document.createElement('tr');
        row.innerHTML = `<td>${site}</td><td>${timeSpent}</td>`;
        siteList.appendChild(row);
    });
}

function convertMsToHoursMinutes(milliseconds) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    let hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
}

//Logica de botón hacia atras
const backButton = document.getElementById('back-button');
    backButton.addEventListener('click', function() {
        window.location.href = "../pages/popup.html"; // Cambia 'index.html' por la ruta de tu página principal
    });

    //Logica del botón reset
    const resetButton = document.getElementById('reset-button');
resetButton.addEventListener('click', function() {
    chrome.storage.local.set({ 'totalTimePerSite': {} }, function() {
        populateSiteList({});
    });
});