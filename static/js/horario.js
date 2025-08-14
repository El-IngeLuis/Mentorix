document.getElementById("form-horario").addEventListener("submit", async (e) => {
    e.preventDefault();

    const materia = document.getElementById("materia").value;
    const dia = document.getElementById("dia").value;
    const hora_inicio = document.getElementById("hora_inicio").value;
    const hora_fin = document.getElementById("hora_fin").value;

    const res = await fetch("/api/horario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materia, dia, hora_inicio, hora_fin })
    });

    const data = await res.json();
    if (data.horario) {
        mostrarHorario(data.horario);
    }

    document.getElementById("form-horario").reset();
});

async function cargarHorario() {
    const res = await fetch("/api/horario");
    const data = await res.json();
    mostrarHorario(data);
}

function mostrarHorario(lista) {
    const ul = document.getElementById("lista-horario");
    ul.innerHTML = "";
    lista.forEach(item => {
        ul.innerHTML += `<li>${item.materia} - ${item.dia} (${item.hora_inicio} - ${item.hora_fin})</li>`;
    });
}

cargarHorario();
