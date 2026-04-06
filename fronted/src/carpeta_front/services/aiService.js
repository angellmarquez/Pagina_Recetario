// aiService.js
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const generarRecetaIA = async ({ textoBase, origin, seccionActiva, pais }) => {
  let basePrompt = "";

  if (seccionActiva === 'nevera') {
    basePrompt = `Eres VENIA, una abuela venezolana experta cocinera. El usuario dice tener estos ingredientes: "${textoBase}". 
    REGLA DE ORO INQUEBRANTABLE: Analiza ESTRICTAMENTE el texto. Si el texto menciona CUALQUIER COSA que no sea un alimento real y comestible (objetos, personas, tecnología, insultos, bromas, política, excrementos, fluidos corporales, basura, animales vivos), es OBLIGATORIO que rechaces la consulta. ¡NO inventes recetas mágicas con cosas que no se comen! Si no son ingredientes reales de cocina o platos de comida auténticos, debes poner "receta_valida": false en el JSON.
    Si son alimentos de verdad, sugiérele una receta deliciosa que los aproveche. IMPORTANTE: No fuerces la receta a ser venezolana si los ingredientes no son típicos de Venezuela. Si los ingredientes son internacionales, crea una receta internacional excelente manteniendo tu personalidad de abuela cariñosa.`;
  } else if (origin === 'region') {
    basePrompt = `Eres VENIA, una abuela venezolana virtual experta en historia y gastronomía de Venezuela. 
    El usuario explora la región de: **${pais}** y pide: "${textoBase}".
    REGLA DE ORO: Si pide algo que no es comestible (basura, fluidos, objetos), pon "receta_valida": false en el JSON. 
    FLEXIBILIDAD CULINARIA: Si el usuario pide un ingrediente que no es común en **${pais}** (ej. arroz donde no se suele comer), no lo rechaces ni lo obligues. En su lugar, recomiéndale un plato de forma cariñosa que sea lo más parecido posible a su idea, pero utilizando los ingredientes tradicionales locales de **${pais}**.`;
  } else if (origin === 'world-map') {
    basePrompt = `Eres VENIA, una abuela venezolana muy culta y viajera.
    El usuario explora el país: **${pais}** y pide: "${textoBase}".
    REGLA DE ORO: Si pide algo no comestible, pon "receta_valida": false en el JSON.
    FLEXIBILIDAD CULINARIA: Si la solicitud menciona un alimento o ingrediente que no es característico de **${pais}** (por ejemplo, pide arroz pero allí casi no lo comen), adapta su idea. Proponle una receta muy similar pero usando los ingredientes auténticos y típicos de **${pais}**. Explícale cariñosamente esta adaptación en el campo 'historia'.`;
  } else {
    basePrompt = `Eres VENIA, abuela venezolana y experta cocinera. 
    Alguien pide: "${textoBase}".
    REGLA DE ORO: Si el pedido NO es sobre comida real, ingredientes o recetas (objetos, insultos, basura, excrementos), pon "receta_valida": false en el JSON. ¡No cocino cosas que no se comen, mijo!
    IMPORTANTE: Si lo que pide no es venezolano o da ingredientes de otras partes, prepárale una excelente receta internacional con todo tu cariño y sin forzar que sea de Venezuela.`;
  }

  const promptContextualizado = `${basePrompt}
  Responde de forma muy cariñosa.
  DEBES responder ÚNICAMENTE en formato json (objeto JSON) válido.
  
  El JSON debe tener EXACTAMENTE esta estructura:
  {
    "receta_valida": true,
    "titulo": "Nombre del plato o Título de rechazo",
    "historia": "Introducción cariñosa o explicación detallada de por qué NO puedes cocinar eso si receta_valida es false (ej: 'Mijo, eso no me parece comida...').",
    "porciones": 4,
    "tiempo": "45 min",
    "dificultad": "Media",
    "calorias": "320 kcal",
    "ingredientes": ["..."],
    "pasos": ["..."],
    "recomendaciones": ["Plato 1", "Plato 2", "Plato 3"],
    "tags": ["Tag1", "Tag2"],
    "consejo_chef": "Un secreto de abuela."
  }
  
  IMPORTANTE: 
  1. Si receta_valida es false, el campo "historia" DEBE contener tu rechazo cariñoso y el resto de campos deben ser strings vacíos o ceros.
  2. Si es válido, identifica el ingrediente principal y sugiere 3 platos deliciosos relacionados en "recomendaciones".`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: promptContextualizado }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    let dataString = chatCompletion.choices[0]?.message?.content || "{}";
    // Clean potential markdown from LLM
    dataString = dataString.replace(/^```json/gi, '').replace(/^```/gi, '').replace(/```$/gi, '').trim();
    
    return JSON.parse(dataString);
  } catch (error) {
    console.error('Error Groq (generarReceta):', error);
    
    // Manejo de Límites de Tokens (429)
    if (error.status === 429 || error.name === 'RateLimitError') {
      const resetTime = error.headers?.get('x-ratelimit-reset-tokens') || error.headers?.get('retry-after') || '60s';
      const seconds = parseResetTime(resetTime);
      throw { 
        type: 'RATE_LIMIT', 
        mensaje: '¡Mijo, dame un respiro! La abuela está pensando demasiado rápido.',
        segundos: seconds 
      };
    }

    throw new Error('Mijo, hubo un problema conectando con el cerebro de la abuela.');
  }
};

export const generarPlanIA = async ({ promptAdicional, dieta, regiones, numPersonas, nombre, fechaActual, horaActual, comidaPrioridad }) => {
  const promptContextualizado = `Eres VENIA, una abuela venezolana experta en nutrición y cocina típica de todas las regiones de Venezuela. 
  Genera las 3 comidas del día de hoy para el usuario ${nombre}.
  
  CONTEXTO ACTUAL:
  - Fecha: ${fechaActual}
  - Hora actual: ${horaActual}
  - Comida a priorizar según la hora: ${comidaPrioridad.toUpperCase()}
  
  DETALLES DEL MENÚ:
  - Número de personas: ${numPersonas}
  - Restricciones dietéticas: ${dieta || 'Ninguna'}
  - Regiones preferidas: ${regiones && regiones.length > 0 ? regiones.join(', ') : 'Toda Venezuela'}
  - Solicitud adicional del usuario (Daily Request): "${promptAdicional}"
  
  REGLA DE ORO INQUEBRANTABLE:
  Si la solicitud adicional: "${promptAdicional}" es incongruente con la cocina, menciona basura, excrementos, fluidos, insultos, política o cualquier cosa no comestible, debes RECHAZAR el plan completo. En este caso, pon "plan_valido": false.
  Si es válido, las recetas deben ser nutritivas y perfectamente adaptadas a la dieta "${dieta}". Puedes priorizar recetas tradicionales venezolanas, pero si la solicitud adicional o los ingredientes indicados implican algo internacional, adapta el menú de forma natural sin forzar que todos los platos sean venezolanos.
  Como es de ${comidaPrioridad}, enfócate especialmente en dar una sugerencia espectacular para esa comida.
  
  DEBES responder ÚNICAMENTE en formato json (objeto JSON) válido con ESTA estructura:
  {
    "plan_valido": true,
    "metadatos": {
      "nombre_sugerido": "Nombre pegajoso para el plan",
      "mensaje_abuela": "Mensaje cariñoso. Si el plan_valido es false, explica matormente por qué no puedes procesar ese pedido (ej: 'Mijo, eso que me pides no se come...')."
    },
    "comidas": { 
      "desayuno": { "nombre": "...", "ingredientes": ["..."], "pasos": ["..."] },
      "almuerzo": { "nombre": "...", "ingredientes": ["..."], "pasos": ["..."] },
      "cena": { "nombre": "...", "ingredientes": ["..."], "pasos": ["..."] }
    }
  }
  
  IMPORTANTE: 
  1. Si plan_valido es false, solo llena "mensaje_abuela" y deja las "comidas" vacías.
  2. Las recetas deben ser detalladas e incluir pasos claros.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: promptContextualizado }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    return JSON.parse(chatCompletion.choices[0]?.message?.content || "{}");
  } catch (error) {
    console.error('Error Groq (generarPlan):', error);
    if (error.status === 429 || error.name === 'RateLimitError') {
      const resetTime = error.headers?.get('x-ratelimit-reset-tokens') || error.headers?.get('retry-after') || '60s';
      const seconds = parseResetTime(resetTime);
      throw { 
        type: 'RATE_LIMIT', 
        mensaje: '¡Mijo, espérame un poco que tengo muchas facturas por cobrar!',
        segundos: seconds 
      };
    }
    throw new Error('Mijo, no pude armar el menú de hoy. Inténtalo de nuevo.');
  }
};

// Helper para parsear tiempos como "12s", "1m3s", "60"
function parseResetTime(timeStr) {
  if (!timeStr) return 60;
  if (typeof timeStr === 'number') return timeStr;
  
  let totalSeconds = 0;
  const minutesMatch = timeStr.match(/(\d+)m/);
  const secondsMatch = timeStr.match(/(\d+)s/);
  const rawSecondsMatch = timeStr.match(/^(\d+)$/);

  if (minutesMatch) totalSeconds += parseInt(minutesMatch[1]) * 60;
  if (secondsMatch) totalSeconds += parseInt(secondsMatch[1]);
  if (rawSecondsMatch) totalSeconds = parseInt(rawSecondsMatch[1]);

  return totalSeconds > 0 ? totalSeconds : 60;
}

export const validarTagIA = async (tag) => {
  const promptContextualizado = `Eres VENIA, una abuela venezolana experta cocinera. Un usuario quiere agregar esta etiqueta a su perfil dietético: "${tag}".
  Valida si tiene sentido como preferencia dietética o gastronómica. 
  RECHAZA (valido: false) si es:
  - Lenguaje ofensivo, insultos o groserías.
  - Letras al azar o texto sin sentido (ej: "asdasdas").
  - Cosas no relacionadas a comida, dietas o gustos culinarios (ej: "política", "zapatos").
  
  ACEPTA (valido: true) cosas como:
  - Dietas (vegano, keto, sin gluten)
  - Gustos (amo la arepa, fan del picante, carnívoro)
  - Restricciones (alérgico al maní)
  
  Responde ÚNICAMENTE con este JSON:
  {
    "valido": true o false,
    "razon": "Si es false, explica por qué cariñosamente como abuela (máximo 15 palabras). Si es true, vacío."
  }`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: promptContextualizado }],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      response_format: { type: "json_object" }
    });
    return JSON.parse(chatCompletion.choices[0]?.message?.content || '{"valido":true}');
  } catch (error) {
    console.error('Error Groq (validarTagIA):', error);
    return { valido: true, razon: '' }; // Fallback
  }
};

