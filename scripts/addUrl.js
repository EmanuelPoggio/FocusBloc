document.addEventListener('DOMContentLoaded', function() {
    let modal = document.getElementById('url-modal');
    let btn = document.getElementById('open-url-modal');
    let span = document.getElementsByClassName('close')[0];
    let addUrlButton = document.getElementById('add-url');
    let urlInput = document.getElementById('url-input');
    let prevPageButton = document.getElementById('prev-page');
    let nextPageButton = document.getElementById('next-page');

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

    addUrlButton.addEventListener('click', function() {
        let url = urlInput.value.trim();

        if (url) {
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
        }
    });

    function updateUrlList() {
        chrome.storage.local.get('urlList', function(data) {
            let urlList = data.urlList || [];
            let urlListContainer = document.getElementById('url-list');
            urlListContainer.innerHTML = '';

            let start = currentPage * itemsPerPage;
            let end = start + itemsPerPage;
            let paginatedUrls = urlList.slice(start, end);

            paginatedUrls.forEach(function(url) {
                let li = document.createElement('li');
                li.textContent = url;

                // Creacion de botones para la lista

                let buttonContainer = document.createElement('div');
                buttonContainer.classList.add('button-container');

                let btn1 = document.createElement('button');
                btn1.textContent = 'Btn1';
                btn1.classList.add('small-button');
                btn1.id = 'btn1';


                let btn2 = document.createElement('button');
                btn2.textContent = 'Btn2';
                btn2.classList.add('small-button');

                let btn3 = document.createElement('button');
                btn3.textContent = 'X';
                btn3.classList.add('small-button');

                buttonContainer.appendChild(btn1);
                buttonContainer.appendChild(btn2);
                buttonContainer.appendChild(btn3);
                li.appendChild(buttonContainer);

                urlListContainer.appendChild(li);
            });

            updatePaginationButtons(urlList.length);
        });
    }

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



});
