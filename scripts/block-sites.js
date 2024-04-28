// block-sites.js
document.getElementById('add-site').addEventListener('click', () => {
    const newSite = document.getElementById('new-site').value;
    chrome.storage.local.get(['blockedSites'], function(result) {
        const blockedSites = result.blockedSites || [];
        if (!blockedSites.includes(newSite)) {
        blockedSites.push(newSite);
        chrome.storage.local.set({ 'blockedSites': blockedSites }, () => {
            console.log(`Sitio añadido a la lista de bloqueo: ${newSite}`);
            updateBlockedSites(blockedSites); // Llama a la función de background.js
            document.getElementById('new-site').value = ''; // Limpiar input
            displayBlockedSites(blockedSites); // Actualizar la lista en la UI
        });
        }
    });
});
function displayBlockedSites(blockedSites) {
    const list = document.getElementById('blocked-list');
    list.innerHTML = '';
    blockedSites.forEach((site, index) => {
        const item = document.createElement('li');
        item.textContent = site;
        
        // Crear botón de desbloqueo
        const removeButton = document.createElement('button');
        removeButton.textContent = 'X';
        removeButton.onclick = function() {
            unblockSite(index);  // Función para desbloquear el sitio
        };

        // Añadir el botón al elemento de lista
        item.appendChild(removeButton);
        list.appendChild(item);
    });
}
function unblockSite(index) {
    chrome.storage.local.get(['blockedSites'], function(result) {
        const blockedSites = result.blockedSites || [];
        blockedSites.splice(index, 1);  // Eliminar el sitio de la lista
        chrome.storage.local.set({'blockedSites': blockedSites}, () => {
            updateBlockedSites(blockedSites);  // Actualizar las reglas de bloqueo
            displayBlockedSites(blockedSites);  // Actualizar la UI
        });
    });
}
chrome.storage.local.get(['blockedSites'], function(result) {
    displayBlockedSites(result.blockedSites || []);
});
