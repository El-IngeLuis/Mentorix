from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import os, json
from openai import OpenAI

# Cargar variables de entorno
load_dotenv()
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

client = OpenAI()
app = Flask(__name__)

# Guardar horario en memoria (luego podemos usar BD)
horario = []

# ---------------- Cargar respuestas personalizadas desde JSON ----------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ruta_json = os.path.join(BASE_DIR, "respuestas.json")

try:
    with open(ruta_json, "r", encoding="utf-8") as f:
        respuestas_personalizadas = json.load(f)
except FileNotFoundError:
    print("⚠️ No se encontró 'respuestas.json'. Se usará un diccionario vacío.")
    respuestas_personalizadas = {}

# ---------------- Rutas principales ----------------
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/chat")
def chat_page():
    return render_template("chat.html")

@app.route("/horario")
def horario_page():
    return render_template("horario.html")

# ---------------- API del Chat ----------------
@app.route("/api/chat", methods=["POST"])
def api_chat():
    data = request.json
    pregunta = data.get("pregunta", "").lower()  # Convertimos a minúsculas

    if not pregunta:
        return jsonify({"error": "Falta la pregunta"}), 400

    # Revisar si la pregunta tiene respuesta personalizada
    for clave, valor in respuestas_personalizadas.items():
        if clave in pregunta:
            return jsonify({"respuesta": valor})

    # Llamada a OpenAI para preguntas normales
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Eres Mentorix, un asistente de estudio que explica de forma clara con ejemplos prácticos."},
                {"role": "user", "content": pregunta}
            ],
            max_tokens=400
        )
        texto_respuesta = response.choices[0].message.content
        return jsonify({"respuesta": texto_respuesta})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------- API del Horario ----------------
@app.route("/api/horario", methods=["GET"])
def obtener_horario():
    return jsonify(horario)

@app.route("/api/horario", methods=["POST"])
def agregar_materia():
    data = request.json
    materia = data.get("materia")
    dia = data.get("dia")
    hora_inicio = data.get("hora_inicio")
    hora_fin = data.get("hora_fin")

    if not all([materia, dia, hora_inicio, hora_fin]):
        return jsonify({"error": "Faltan datos para agregar la materia"}), 400

    horario.append({
        "materia": materia,
        "dia": dia,
        "hora_inicio": hora_inicio,
        "hora_fin": hora_fin
    })

    return jsonify({"mensaje": "Materia agregada", "horario": horario})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
