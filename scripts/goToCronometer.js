document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(event) {
        if (event.target && event.target.id === 'cronometro-button') {
            window.location.href = "../pages/Cronometro.html";
        }
    });
});
