document.addEventListener('DOMContentLoaded', function() {
    let modal = document.getElementById('url-modal');
    let btn = document.getElementById('open-url-modal');
    let span = document.getElementsByClassName('close')[0];
    let addUrlButton = document.getElementById('add-url');
    let urlInput = document.getElementById('url-input');
    let prevPageButton = document.getElementById('prev-page');
    let nextPageButton = document.getElementById('next-page');
    let messageContainer = document.getElementById('message-container'); // Contenedor para el mensaje

    let currentPage = 0;
    const itemsPerPage = 3;

    btn.onclick = function() {
        modal.style.display = "block";
    }

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    function isValidUrl(url) {
        const pattern = /^https:\/\/[^\s/$.?#].[^\s]*$/;
        return pattern.test(url);
    }

    addUrlButton.addEventListener('click', function() {
        let url = urlInput.value.trim();

        if (url && isValidUrl(url)) {
            chrome.storage.local.get('urlList', function(data) {
                let urlList = data.urlList || [];
                urlList.push(url);
                chrome.storage.local.set({ urlList: urlList }, function() {
                    console.log('URL almacenada:', url);
                    updateUrlList();
                    urlInput.value = ''; // Limpiar el input
                    modal.style.display = "none"; // Cerrar el modal
                });
            });
        } else {
            alert('Por favor, ingrese una URL valida');
        }
    });

    function updateUrlList() {
        chrome.storage.local.get('urlList', function(data) {
            let urlList = data.urlList || [];
            let urlListContainer = document.getElementById('url-list');
            urlListContainer.innerHTML = '';

            if (urlList.length === 0) {
                messageContainer.style.display = 'block';
            } else {
                messageContainer.style.display = 'none';
                let start = currentPage * itemsPerPage;
                let end = start + itemsPerPage;
                let paginatedUrls = urlList.slice(start, end);

                paginatedUrls.forEach(function(url, index) {
                    let li = document.createElement('li');

                    // Create favicon image element
                    let favicon = document.createElement('img');
                    favicon.src = getUrlIcon(url); // Usar la función getUrlIcon del archivo getUrlIcon.js
                    favicon.classList.add('favicon');
                    li.appendChild(favicon);

                    // Create URL text
                    let urlText = document.createElement('span');
                    urlText.textContent = url;
                    li.appendChild(urlText);

                    // Creacion de botones para la lista
                    let buttonContainer = document.createElement('div');
                    buttonContainer.classList.add('button-container');

                    let btn1 = document.createElement('button');
                    let btn1Icon = document.createElement('img');
                    btn1Icon.src = '../images/icons/Cronometer.png'; 
                    btn1Icon.classList.add('button-icon');
                    btn1.appendChild(btn1Icon);
                    btn1.classList.add('small-button');
                    btn1.id = 'cronometro-button'; // Asegurarse de asignar el ID correcto

                    let btn2 = document.createElement('button');
                    let btn2Icon = document.createElement('img');
                    btn2Icon.src = '../images/icons/Block.png';
                    btn2Icon.classList.add('button-icon');
                    btn2.appendChild(btn2Icon);
                    btn2.classList.add('small-button');

                    let btn3 = document.createElement('button');
                    btn3.textContent = 'X';
                    btn3.classList.add('small-button');
                    btn3.addEventListener('click', function() {
                        let indexToRemove = start + index;
                        deleteUrl(indexToRemove, updateUrlList);
                    });

                    buttonContainer.appendChild(btn1);
                    buttonContainer.appendChild(btn2);
                    buttonContainer.appendChild(btn3);
                    li.appendChild(buttonContainer);

                    urlListContainer.appendChild(li);
                });

                updatePaginationButtons(urlList.length);
            }
        });
    }

    //Paginacion dentro de la lista
    function updatePaginationButtons(totalItems) {
        let totalPages = Math.ceil(totalItems / itemsPerPage);

        prevPageButton.disabled = currentPage === 0;
        nextPageButton.disabled = currentPage >= totalPages - 1;
    }

    prevPageButton.addEventListener('click', function() {
        if (currentPage > 0) {
            currentPage--;
            updateUrlList();
        }
    });

    nextPageButton.addEventListener('click', function() {
        chrome.storage.local.get('urlList', function(data) {
            let urlList = data.urlList || [];
            let totalPages = Math.ceil(urlList.length / itemsPerPage);

            if (currentPage < totalPages - 1) {
                currentPage++;
                updateUrlList();
            }
        });
    });

    updateUrlList();

    // Añade un event listener para el botón del cronómetro
    document.addEventListener('click', function(event) {
        if (event.target && event.target.closest('#cronometro-button')) {
            window.location.href = "../pages/Cronometro.html";
        }
    });
});
