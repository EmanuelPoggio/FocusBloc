document.addEventListener('DOMContentLoaded', function() {
    let pomodoroButton = document.getElementById('pomodoro-button');
    let siteTimerButton = document.getElementById('site-timer');

    pomodoroButton.addEventListener('click', function() {
        window.location.href = '../pages/pomodoro.html'; 
    });

    siteTimerButton.addEventListener('click', function() {
        window.location.href = '../pages/site-time.html'; 
    });
});


//Icono de pagina en las url
document.addEventListener('DOMContentLoaded', function() {
    let script = document.createElement('script');
    script.src = "../scripts/getUrlIcon.js";
    script.onload = function() {

        let urlManagerScript = document.createElement('script');
        urlManagerScript.src = "../scripts/urlManager.js";
        document.head.appendChild(urlManagerScript);
    };
    document.head.appendChild(script);
});
