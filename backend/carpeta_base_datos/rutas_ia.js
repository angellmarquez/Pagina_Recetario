const express = require('express');
const router = express.Router();
const axios = require('axios');
const { verificarToken } = require('../middleware/auth');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Helper: llamar a Groq
async function llamarGroq(messages, model = 'llama-3.3-70b-versatile', temperature = 0.7) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error('GROQ_API_KEY no configurada en el servidor');
    }

    const response = await axios.post(GROQ_API_URL, {
        model,
        messages,
        temperature,
        response_format: { type: 'json_object' }
    }, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        timeout: 60000
    });

    const content = response.data.choices[0]?.message?.content || '{}';
    return JSON.parse(content.replace(/^```json/gi, '').replace(/^```/gi, '').replace(/```$/gi, '').trim());
}

// POST /api/ai/receta — Generar receta
router.post('/receta', verificarToken, async (req, res) => {
    const { textoBase, seccionActiva, origin, pais } = req.body;

    if (!textoBase || !textoBase.trim()) {
        return res.status(400).json({ success: false, mensaje: 'Texto de búsqueda requerido' });
    }

    // Sanitizar input
    const texto = textoBase.toString().slice(0, 500);

    let basePrompt = "";

    if (seccionActiva === 'nevera') {
        basePrompt = `Eres VENIA, una abuela venezolana experta cocinera. El usuario dice tener estos ingredientes: "${texto}". 
        REGLA DE ORO INQUEBRANTABLE: Analiza ESTRICTAMENTE el texto. Si el texto menciona CUALQUIER COSA que no sea un alimento real y comestible (objetos, personas, tecnología, insultos, bromas, política, excrementos, fluidos corporales, basura, animales vivos), es OBLIGATORIO que rechaces la consulta. Si no son ingredientes reales, debes poner "receta_valida": false en el JSON.
        Si son alimentos de verdad, sugiérele una receta deliciosa.`;
    } else if (origin === 'region') {
        basePrompt = `Eres VENIA, una abuela venezolana virtual experta en historia y gastronomía de Venezuela. 
        El usuario está explorando el Estado: **${pais}**. 
        Petición: "${texto}".
        REGLA DE ORO: Si pide algo no comestible, pon "receta_valida": false.
        La receta DEBE ser un plato auténtico del Estado **${pais}** en Venezuela.`;
    } else if (origin === 'world-map') {
        basePrompt = `Eres VENIA, una abuela venezolana culta y viajera.
        El usuario explora el país: **${pais}** y pide: "${texto}".
        REGLA DE ORO: Si pide algo no comestible, pon "receta_valida": false.
        La receta DEBE ser un plato auténtico de **${pais}**.`;
    } else {
        basePrompt = `Eres VENIA, abuela venezolana experta cocinera. 
        Alguien pide: "${texto}".
        REGLA DE ORO: Si no es sobre comida real, pon "receta_valida": false.`;
    }

    const promptContextualizado = `${basePrompt}
    Responde de forma cariñosa.
    DEBES responder ÚNICAMENTE en formato json válido.
    El JSON debe tener EXACTAMENTE esta estructura:
    {
        "receta_valida": true,
        "titulo": "Nombre del plato",
        "historia": "Introducción cariñosa o explicación de rechazo.",
        "porciones": 4, "tiempo": "45 min", "dificultad": "Media", "calorias": "320 kcal",
        "ingredientes": ["..."], "pasos": ["..."],
        "recomendaciones": ["Plato 1", "Plato 2", "Plato 3"],
        "tags": ["Tag1", "Tag2"],
        "consejo_chef": "Un secreto de abuela."
    }
    Si receta_valida es false, "historia" DEBE contener tu rechazo cariñoso.`;

    try {
        const data = await llamarGroq([{ role: 'user', content: promptContextualizado }]);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error Groq (receta):', error?.response?.data || error.message);
        if (error?.response?.status === 429) {
            const resetTime = error.response.headers?.['x-ratelimit-reset-tokens'] || error.response.headers?.['retry-after'] || '60';
            return res.status(429).json({ 
                success: false, 
                type: 'RATE_LIMIT',
                mensaje: '¡Mijo, dame un respiro!',
                segundos: parseResetTime(resetTime)
            });
        }
        res.status(500).json({ success: false, mensaje: 'Error conectando con el cerebro de la abuela.' });
    }
});

// POST /api/ai/plan — Generar plan diario
router.post('/plan', verificarToken, async (req, res) => {
    const { promptAdicional, dieta, regiones, numPersonas, nombre, fechaActual, horaActual, comidaPrioridad } = req.body;

    const promptContextualizado = `Eres VENIA, una abuela venezolana experta en nutrición y cocina típica. 
    Genera las 3 comidas del día de hoy para ${nombre || 'el usuario'}.
    
    CONTEXTO: Fecha: ${fechaActual} | Hora: ${horaActual} | Comida a priorizar: ${(comidaPrioridad || 'almuerzo').toUpperCase()}
    Porciones: ${numPersonas || 1} | Dieta: ${dieta || 'Ninguna'} | Regiones: ${regiones?.join(', ') || 'Toda Venezuela'}
    Solicitud adicional: "${(promptAdicional || '').toString().slice(0, 300)}"
    
    REGLA DE ORO: Si la solicitud adicional es incongruente con la cocina, pon "plan_valido": false.
    
    Responde ÚNICAMENTE en JSON:
    {
        "plan_valido": true,
        "metadatos": { "nombre_sugerido": "...", "mensaje_abuela": "..." },
        "comidas": { 
            "desayuno": { "nombre": "...", "ingredientes": ["..."], "pasos": ["..."] },
            "almuerzo": { "nombre": "...", "ingredientes": ["..."], "pasos": ["..."] },
            "cena": { "nombre": "...", "ingredientes": ["..."], "pasos": ["..."] }
        }
    }`;

    try {
        const data = await llamarGroq([{ role: 'user', content: promptContextualizado }]);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error Groq (plan):', error?.response?.data || error.message);
        if (error?.response?.status === 429) {
            return res.status(429).json({ success: false, type: 'RATE_LIMIT', mensaje: '¡Espérame un poco!', segundos: 60 });
        }
        res.status(500).json({ success: false, mensaje: 'No pude armar el menú de hoy.' });
    }
});

// POST /api/ai/validar-tag — Validar etiqueta dietética
router.post('/validar-tag', verificarToken, async (req, res) => {
    const { tag } = req.body;
    if (!tag || !tag.trim()) return res.status(400).json({ valido: false, razon: 'Tag vacío' });

    const prompt = `Eres VENIA. Valida si "${tag.toString().slice(0, 50)}" tiene sentido como preferencia dietética.
    RECHAZA (valido: false) si es lenguaje ofensivo, texto sin sentido, o no relacionado a comida.
    ACEPTA (valido: true) dietas, gustos, restricciones.
    Responde ÚNICAMENTE: { "valido": true/false, "razon": "..." }`;

    try {
        const data = await llamarGroq([{ role: 'user', content: prompt }], 'llama-3.1-8b-instant', 0.1);
        res.json(data);
    } catch (error) {
        res.json({ valido: true, razon: '' }); // Fallback permisivo
    }
});

// POST /api/ai/esqueleto-semanal — Generar esqueleto del plan semanal
router.post('/esqueleto-semanal', verificarToken, async (req, res) => {
    const { promptAdicional, dieta, numPersonas, nombre } = req.body;

    const prompt = `Eres VENIA, la abuela venezolana.
    Genera un ESQUELETO SEMANAL de comidas para ${nombre || 'tu nieto/a'}. Solo los NOMBRES de los platos.
    Porciones: ${numPersonas || 1} | Dieta: ${dieta || 'Tradicional Venezolano'} | Peticiones: "${(promptAdicional || '').toString().slice(0, 300)}"
    
    Responde ÚNICAMENTE en JSON:
    {
      "lunes": { "desayuno": "Nombre", "almuerzo": "Nombre", "cena": "Nombre" },
      "martes": { "desayuno": "Nombre", "almuerzo": "Nombre", "cena": "Nombre" },
      "miercoles": { "desayuno": "Nombre", "almuerzo": "Nombre", "cena": "Nombre" },
      "jueves": { "desayuno": "Nombre", "almuerzo": "Nombre", "cena": "Nombre" },
      "viernes": { "desayuno": "Nombre", "almuerzo": "Nombre", "cena": "Nombre" },
      "sabado": { "desayuno": "Nombre", "almuerzo": "Nombre", "cena": "Nombre" },
      "domingo": { "desayuno": "Nombre", "almuerzo": "Nombre", "cena": "Nombre" }
    }`;

    try {
        const data = await llamarGroq([{ role: 'user', content: prompt }], 'llama-3.1-8b-instant', 0.7);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error Groq (esqueleto):', error?.response?.data || error.message);
        res.status(500).json({ success: false, mensaje: 'No pude generar el menú de la semana.' });
    }
});

// POST /api/ai/discover-feed — Generar feed de descubrimiento
router.post('/discover-feed', verificarToken, async (req, res) => {
    const { isLoadMore } = req.body;

    const prompt = `Eres VENIA, una experta abuela venezolana. 
    Dame ${isLoadMore ? 'OTRAS ' : ''}6 recetas de platos variados y CULTURALMENTE EXACTOS de Venezuela.
    ${isLoadMore ? 'ASEGÚRATE DE QUE SEAN PLATOS DISTINTOS. NO repitas los más comunes.' : ''}
    Variedad (desayuno, almuerzo, cena, postre, sopa).
    Usa nombres oficiales e históricos exactos.
    Devuelve ÚNICAMENTE en JSON:
    {
        "feed": [
            { "titulo": "Nombre", "descripcion_corta": "Breve frase.", "tiempo": "15 min", "tags": ["Desayuno", "Maíz"] }
        ]
    }`;

    try {
        const data = await llamarGroq([{ role: 'user', content: prompt }], 'llama-3.3-70b-versatile', isLoadMore ? 0.9 : 0.8);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error Groq (feed):', error?.response?.data || error.message);
        res.status(500).json({ success: false, mensaje: 'Error al cargar recomendaciones.' });
    }
});

function parseResetTime(timeStr) {
    if (!timeStr) return 60;
    if (typeof timeStr === 'number') return timeStr;
    let totalSeconds = 0;
    const minutesMatch = timeStr.toString().match(/(\d+)m/);
    const secondsMatch = timeStr.toString().match(/(\d+)s/);
    const rawSecondsMatch = timeStr.toString().match(/^(\d+)$/);
    if (minutesMatch) totalSeconds += parseInt(minutesMatch[1]) * 60;
    if (secondsMatch) totalSeconds += parseInt(secondsMatch[1]);
    if (rawSecondsMatch) totalSeconds = parseInt(rawSecondsMatch[1]);
    return totalSeconds > 0 ? totalSeconds : 60;
}

module.exports = router;
