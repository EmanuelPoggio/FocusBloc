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
