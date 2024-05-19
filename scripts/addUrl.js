document.addEventListener('DOMContentLoaded', function() {
    // Manejar agregar URL
    document.getElementById('add-url').addEventListener('click', function() {
        let urlInput = document.getElementById('url-input');
        let url = urlInput.value.trim();

        if (url) {
            chrome.storage.local.get('urlList', function(data) {
                let urlList = data.urlList || [];
                urlList.push(url);
                chrome.storage.local.set({ urlList: urlList }, function() {
                    console.log('URL almacenada:', url);
                    updateUrlList();
                    urlInput.value = ''; // Limpiar el input
                });
            });
        }
    });

    // Función para actualizar la visualización de la lista
    function updateUrlList() {
        chrome.storage.local.get('urlList', function(data) {
            let urlList = data.urlList || [];
            let urlListContainer = document.getElementById('url-list');
            urlListContainer.innerHTML = '';

            urlList.forEach(function(url) {
                let li = document.createElement('li');
                li.textContent = url;

                // Crear botón Pomodoro
                let pomodoroButton = document.createElement('button');
                pomodoroButton.textContent = 'Pomodoro';
                pomodoroButton.className = 'pomodoro-btn';
                pomodoroButton.addEventListener('click', function() {
                    window.location.href = '../pages/pomodoro.html';
                });

                // Crear botón Site Timer
                let siteTimerButton = document.createElement('button');
                siteTimerButton.textContent = 'Site Timer';
                siteTimerButton.className = 'site-timer-btn';
                siteTimerButton.addEventListener('click', function() {
                    window.location.href = '../pages/site-time.html';
                });

                // Agregar botones al elemento de la lista
                li.appendChild(pomodoroButton);
                li.appendChild(siteTimerButton);

                // Agregar elemento de la lista al contenedor
                urlListContainer.appendChild(li);
            });
        });
    }

    // Inicializar la lista de URLs al cargar la página
    updateUrlList();
});
