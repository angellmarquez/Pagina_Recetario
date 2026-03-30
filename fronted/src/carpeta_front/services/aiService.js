// aiService.js
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const generarRecetaIA = async ({ textoBase, origin, seccionActiva }) => {
  let basePrompt = "";

  if (seccionActiva === 'nevera') {
    basePrompt = `Eres VENIA, una abuela venezolana experta cocinera. El usuario dice tener estos ingredientes: "${textoBase}". 
    REGLA DE ORO INQUEBRANTABLE: Analiza ESTRICTAMENTE el texto. Si el texto menciona CUALQUIER COSA que no sea un alimento real y comestible (objetos, personas, tecnología, insultos, bromas), es OBLIGATORIO que rechaces la consulta. ¡NO inventes recetas mágicas con objetos! Si no son ingredientes reales de cocina, debes fallar la validación.
    Si son verdaderos alimentos, sugiérele una receta venezolana que los aproveche.`;
  } else if (origin === 'region') {
    basePrompt = `Eres VENIA, una abuela venezolana virtual experta en historia y gastronomía tradicional. 
    El usuario quiere conocer la receta más emblemática del estado: ${textoBase}.
    REGLA: Devuelve SOLO platos típicos reales de esa región.`;
  } else {
    basePrompt = `Eres VENIA, una abuela venezolana virtual y experta cocinera de comida típica de Venezuela. 
    Alguien te ha pedido: "${textoBase}".
    REGLA DE ORO INQUEBRANTABLE: Si el usuario pide cualquier cosa ajena a platos de comida reales, ingredientes o recetas, es OBLIGATORIO que rechaces la consulta. ¡NO generes recetas de cosas que no se comen!`;
  }

  const promptContextualizado = `${basePrompt}
  Responde de forma muy cariñosa, dándole la receta detallada.
  DEBES responder ÚNICAMENTE en formato json (objeto JSON) válido.
  
  El JSON debe tener EXACTAMENTE esta estructura:
  {
    "titulo": "Nombre del plato (ej: Arepa Pelúa)",
    "historia": "Una breve introducción cariñosa de la abuela sobre este plato.",
    "porciones": 4,
    "tiempo": "45 min",
    "dificultad": "Media",
    "calorias": "320 kcal",
    "ingredientes": ["3 huevos", "2 tazas de harina..."],
    "pasos": ["Enciende la wafflera...", "Agrega la harina..."],
    "recomendaciones": ["Nombre de plato 1", "Nombre de plato 2", "Nombre de plato 3"],
    "tags": ["Desayuno", "Tradicional", "Sin Gluten"],
    "consejo_chef": "Para que la arepa quede bien crocantica, agrégale un chorrito de aceite a la masa antes de armarla."
  }
  
  IMPORTANTE:
  1. Si la solicitud NO ES 100% SOBRE COMIDA REAL, pon OBLIGATORIAMENTE "receta_valida": false en el JSON y llena "historia" explicando que solo sabes de cocina.
  2. Identifica el ingrediente principal y sugiere 3 platos venezolanos exactos en "recomendaciones".
  3. El "titulo" debe ser el NOMBRE OFICIAL Y REAL del plato.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: promptContextualizado }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.85,
      response_format: { type: "json_object" },
    });

    let dataString = chatCompletion.choices[0]?.message?.content || "{}";
    // Clean potential markdown from LLM
    dataString = dataString.replace(/^```json/gi, '').replace(/^```/gi, '').replace(/```$/gi, '').trim();
    
    return JSON.parse(dataString);
  } catch (error) {
    console.error('Error Groq (generarReceta):', error);
    throw new Error('Mijo, hubo un problema conectando con el cerebro de la abuela.');
  }
};

export const generarPlanIA = async ({ promptAdicional, dieta, regiones, numPersonas, nombre }) => {
  const promptContextualizado = `Eres VENIA, una abuela venezolana experta en nutrición y cocina típica de todas las regiones de Venezuela. 
  Crea un plan semanal (Lunes a Domingo) de alimentación venezolana balanceada para el usuario ${nombre}.
  
  DETALLES DEL PLAN:
  - Número de personas: ${numPersonas}
  - Restricciones dietéticas: ${dieta || 'Ninguna'}
  - Regiones preferidas: ${regiones && regiones.length > 0 ? regiones.join(', ') : 'Toda Venezuela'}
  - Solicitud adicional del usuario: "${promptAdicional}"
  
  REGLA DE ORO: Las recetas deben ser tradicionales venezolanas, nutritivas y perfectamente adaptadas a la dieta "${dieta}". 
  Si el usuario eligió regiones específicas, el 80% de los platos deben ser típicos de esas zonas.
  
  DEBES responder ÚNICAMENTE en formato json (objeto JSON) válido con ESTA estructura:
  {
    "metadatos": {
      "nombre_sugerido": "Nombre pegajoso para el plan (ej: Semana Criolla Ligera)",
      "mensaje_abuela": "Un mensaje corto y cariñoso de la abuela sobre este plan."
    },
    "lunes": { 
      "desayuno": { "nombre": "...", "ingredientes": ["..."], "pasos": ["..."] },
      "almuerzo": { "nombre": "...", "ingredientes": ["..."], "pasos": ["..."] },
      "cena": { "nombre": "...", "ingredientes": ["..."], "pasos": ["..."] }
    },
    ... (hasta domingo)
  }
  
  IMPORTANTE: Las recetas deben ser detalladas e incluir pasos claros.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: promptContextualizado }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });
    return JSON.parse(chatCompletion.choices[0]?.message?.content || "{}");
  } catch (error) {
    console.error('Error Groq (generarPlan):', error);
    throw new Error('Mijo, no pude armar el plan. Inténtalo de nuevo.');
  }
};

