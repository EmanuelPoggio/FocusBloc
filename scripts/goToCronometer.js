document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(event) {
        if (event.target && event.target.id === 'btn1') {
            window.location.href = "../pages/Cronometro.html";
        }
    });
});
