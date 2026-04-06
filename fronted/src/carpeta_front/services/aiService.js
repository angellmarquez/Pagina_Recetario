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
    Si son alimentos de verdad, sugiérele una receta venezolana deliciosa que los aproveche.`;
  } else if (origin === 'region') {
    basePrompt = `Eres VENIA, una abuela venezolana virtual experta en historia y gastronomía de Venezuela. 
    El usuario explora el estado: **${pais}** y pide: "${textoBase}".
    REGLA DE ORO: Si la solicitud NO trata sobre comida real del estado **${pais}**, o si pide algo que no es comestible (basura, fluidos, objetos), pon "receta_valida": false en el JSON y explica cariñosamente que solo hablas de comida venezolana. 
    Si es válido, sugiere una receta auténtica de **${pais}**, describiendo ingredientes y pasos tradicionales.`;
  } else if (origin === 'world-map') {
    basePrompt = `Eres VENIA, una abuela venezolana muy culta y viajera.
    El usuario explora el país: **${pais}** y pide: "${textoBase}".
    REGLA DE ORO: Si la solicitud NO trata sobre comida real o platos típicos de **${pais}**, o si es algo no comestible, pon "receta_valida": false en el JSON.
    Si es válido, sugiere una receta 100% auténtica de **${pais}** que se relacione con lo que pide el usuario.`;
  } else {
    basePrompt = `Eres VENIA, abuela venezolana y experta cocinera. 
    Alguien pide: "${textoBase}".
    REGLA DE ORO: Si el pedido NO es sobre comida real, ingredientes o recetas (objetos, insultos, basura, excrementos), pon "receta_valida": false en el JSON. ¡No cocino cosas que no se comen, mijo!`;
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
  2. Si es válido, identifica el ingrediente principal y sugiere 3 platos venezolanos exactos en "recomendaciones".`;

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
  - Solicitud adicional del usuario: "${promptAdicional}"
  
  REGLA DE ORO: Las recetas deben ser tradicionales venezolanas, nutritivas y perfectamente adaptadas a la dieta "${dieta}". 
  Como es de ${comidaPrioridad}, enfócate especialmente en dar una sugerencia espectacular para esa comida.
  Si el prompt adicional: "${promptAdicional}" NO tiene sentido en un contexto de cocina o comida, ignóralo cariñosamente en tu mensaje pero genera un menú saludable estándar.
  
  DEBES responder ÚNICAMENTE en formato json (objeto JSON) válido con ESTA estructura:
  {
    "metadatos": {
      "nombre_sugerido": "Nombre pegajoso para el plan",
      "mensaje_abuela": "Mensaje cariñoso. Si el usuario pidió algo que no es comida, explícale que te enfocarás en alimentarlo bien con comida de verdad."
    },
    "comidas": { 
      "desayuno": { "nombre": "...", "ingredientes": ["..."], "pasos": ["..."] },
      "almuerzo": { "nombre": "...", "ingredientes": ["..."], "pasos": ["..."] },
      "cena": { "nombre": "...", "ingredientes": ["..."], "pasos": ["..."] }
    }
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
    throw new Error('Mijo, no pude armar el menú de hoy. Inténtalo de nuevo.');
  }
};

