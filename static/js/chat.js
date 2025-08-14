async function enviarPregunta() {
    const pregunta = document.getElementById("pregunta").value.trim();
    if (!pregunta) return;

    const chatBox = document.getElementById("chat-box");

    // Mostrar mensaje del usuario
    const userMsg = document.createElement("div");
    userMsg.className = "message user-message";
    userMsg.innerHTML = `<span>Tú:</span> ${pregunta}`;
    chatBox.appendChild(userMsg);

    // Limpiar input
    document.getElementById("pregunta").value = "";

    // Mostrar indicador de escritura de Mentorix
    const typingMsg = document.createElement("div");
    typingMsg.className = "message mentorix-message";
    typingMsg.id = "typing";
    typingMsg.innerHTML = `<span>Mentorix:</span> escribiendo...`;
    chatBox.appendChild(typingMsg);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pregunta })
        });

        const data = await res.json();

        // Eliminar indicador de escritura
        typingMsg.remove();

        // Mostrar mensaje de Mentorix con Markdown
        const mentorixMsg = document.createElement("div");
        mentorixMsg.className = "message mentorix-message";

        if (data.respuesta) {
            mentorixMsg.innerHTML = `<span>Mentorix:</span><br>${marked.parse(data.respuesta)}`;
        } else {
            mentorixMsg.className = "message error-message";
            mentorixMsg.innerHTML = `<span>Error:</span> ${data.error}`;
        }

        chatBox.appendChild(mentorixMsg);
        chatBox.scrollTop = chatBox.scrollHeight;

    } catch (error) {
        typingMsg.remove();
        const errorMsg = document.createElement("div");
        errorMsg.className = "message error-message";
        errorMsg.innerHTML = `<span>Error:</span> ${error.message}`;
        chatBox.appendChild(errorMsg);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

// Enviar mensaje al presionar Enter
document.getElementById("pregunta").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        enviarPregunta();
    }
});

