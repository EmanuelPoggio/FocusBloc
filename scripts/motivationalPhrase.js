// Función para obtener todas las frases del almacenamiento local y mostrar una aleatoria
function displayRandomMessage() {
    chrome.storage.local.get('customMessages', function(data) {
        var customMessages = data.customMessages || [];
        if (customMessages.length > 0) {
            var randomIndex = Math.floor(Math.random() * customMessages.length);
            var randomMessage = customMessages[randomIndex];
            console.log("Frase aleatoria:", randomMessage);
                 var messageDiv = document.createElement('div');
            messageDiv.textContent = randomMessage;
            messageDiv.className = "random-message"; 
            document.body.appendChild(messageDiv);
        } 
    });
}
// Llama a la función 
displayRandomMessage();
