// Recuperar y mostrar una frase motivacional aleatoria
chrome.storage.local.get('customMessages', function(data) {
    var messages = data.customMessages || [];
    console.log('Mensajes recuperados:', messages);
    if (messages.length > 0) {
        var randomIndex = Math.floor(Math.random() * messages.length);
        var randomMessage = messages[randomIndex];
        console.log('Frase aleatoria:', randomMessage);
        var motivationalMessage = document.getElementById('motivational-message');
        motivationalMessage.innerText = randomMessage;
        motivationalMessage.style.display = 'block'; // Mostrar el mensaje
    } else {
        console.log('No hay mensajes disponibles.');
    }
});
