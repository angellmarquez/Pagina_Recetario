const axios = require('axios');
const connection = require('./carpeta_base_datos/conexion');
const { enviarMensajeWasap } = require('./bot_whatsapp');
const { decrypt } = require('./carpeta_base_datos/encryption');

// Helper para llamar a Groq directamente usando Axios
const generarRecetaPorGroq = async (nombre, comidaPrioridad, numPersonas, dieta, peticionAdicional, tituloPlato) => {
    const apiKey = process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY;
    
    if (!apiKey) {
        console.error('CRON BOT: No hay API KEY de Groq configurada.');
        return null;
    }

    const fechaActual = new Date().toLocaleDateString('es-VE');
    const horaActual = new Date().toLocaleTimeString('es-VE');

    // Instruct specifically to develop this exact dish
    let instruccionPlato = tituloPlato 
        ? `Desarrolla paso a paso la siguiente receta específica: **"${tituloPlato}"** para el ${comidaPrioridad.toUpperCase()}`
        : `Genera una receta inventada o sugerida de ${comidaPrioridad.toUpperCase()}`;

    const promptContextualizado = `Eres VENIA, una abuela venezolana experta en nutrición y cocina típica. 
${instruccionPlato} para el usuario ${nombre}.

CONTEXTO ACTUAL:
- Fecha: ${fechaActual} | Hora: ${horaActual}
- Porciones: ${numPersonas}
- Dieta: ${dieta || 'Ninguna'}
- Petición Especial: "${peticionAdicional || 'Ninguna'}"

REGLA DE ORO INQUEBRANTABLE:
Si la petición especial menciona cosas no comestibles, insultos o basura, pon "receta_valida": false. Si es válida, crea una divina receta adaptada a su dieta.

DEBES responder ÚNICAMENTE en formato json (objeto JSON) válido con ESTA estructura:
{
    "receta_valida": true,
    "mensaje_abuela": "Mensaje cariñoso de por qué le preparaste esto. Si receta_valida es false, aquí le echas la broma por pedir locuras.",
    "comida": { 
        "nombre": "...", 
        "tiempo": "30 min",
        "ingredientes": ["..."], 
        "pasos": ["..."] 
    }
}`;

    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: promptContextualizado }],
            temperature: 0.7,
            response_format: { type: "json_object" }
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        const dataStr = response.data.choices[0]?.message?.content || '{}';
        return JSON.parse(dataStr);
    } catch (error) {
        console.error('CRON BOT GROQ Error:', error?.response?.data || error.message);
        return null;
    }
};

const procesarEnviosDiarios = async () => {
    // Definimos qué comida toca según la hora local de la computadora (Backend)
    const dt = new Date();
    const hora = dt.getHours();
    let comidaPrioridad = '';

    // Lógicas de tiempo tolerante (Ejemplo: de 7am a 9am es Desayuno)
    if (hora === 8 || hora === 9) comidaPrioridad = 'desayuno';
    else if (hora === 12 || hora === 13) comidaPrioridad = 'almuerzo';
    else if (hora === 19 || hora === 20) comidaPrioridad = 'cena';
    else return; // Si no es hora de comida, no hace nada

    const hoy = dt.toISOString().split('T')[0]; // YYYY-MM-DD
    const diaHoyStr = dt.toLocaleDateString('es-VE', { weekday: 'long' }).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    console.log(`⏱️ [CRON BOT] Verificando suscripciones activas para: ${comidaPrioridad.toUpperCase()}...`);

    // Buscar usuarios con suscripción activa que AÚN NO han recibido su comida hoy
    const query = `
        SELECT s.*, u.nombre, u.telefono 
        FROM suscripciones_bot s
        JOIN usuarios u ON s.id_usuario = u.id_usuario
        WHERE s.estado = 'activa' AND u.telefono IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM registros_envios_bot r 
            WHERE r.id_usuario = s.id_usuario 
            AND r.comida_tipo = ? AND r.fecha_envio = ?
        )
    `;

    connection.query(query, [comidaPrioridad, hoy], async (err, usuariosPendientes) => {
        if (err) {
            console.error('CRON BOT Error Query:', err);
            return;
        }

        if (usuariosPendientes.length === 0) return;

        for (const user of usuariosPendientes) {
            try {
                // Desencriptar datos
                const nombreLimpio = decrypt(user.nombre);
                const telefonoLimpio = decrypt(user.telefono);

                // Obtener el plato esqueleto si existe
                let tituloPlatoSkeleton = null;
                if (user.plan_esqueleto) {
                    try {
                        const esqueleto = JSON.parse(user.plan_esqueleto);
                        tituloPlatoSkeleton = esqueleto[diaHoyStr]?.[comidaPrioridad];
                    } catch (e) { console.error('CRON BOT Error JSON Esqueleto:', e); }
                }

                // Generar Receta con IA a demanda, obligando al modelo a crear ingredientes y pasos para ESE titulo
                const jsonReceta = await generarRecetaPorGroq(
                    nombreLimpio, 
                    comidaPrioridad, 
                    user.num_personas, 
                    user.dieta, 
                    user.peticion_adicional,
                    tituloPlatoSkeleton
                );

                if (jsonReceta && jsonReceta.receta_valida && jsonReceta.comida) {
                    const r = jsonReceta.comida;
                    const textoMensaje = `*🍲 VENIA AUTO-CHEF - ${comidaPrioridad.toUpperCase()}* 👩🏽‍🍳✨\n\n` +
                        `*Receta:* ${r.nombre}\n` +
                        `*Porciones:* ${user.num_personas} Pax | *Tiempo:* ${r.tiempo || '30 min'}\n\n` +
                        `💌 *Mensaje de la abuela:* "${jsonReceta.mensaje_abuela}"\n\n` +
                        `*🥣 Ingredientes:* \n` +
                        `${r.ingredientes?.map(i => `• ${i}`).join('\n')}\n\n` +
                        `*📋 Preparación:* \n` +
                        `${r.pasos?.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n` +
                        `*¡Buen provecho, ${nombreLimpio}!*`;

                    // Enviar por WhatsApp
                    await enviarMensajeWasap(telefonoLimpio, textoMensaje);

                    // Registrar para que no se le envíe dos veces hoy
                    connection.promise().query(
                        'INSERT INTO registros_envios_bot (id_usuario, comida_tipo, fecha_envio) VALUES (?, ?, ?)',
                        [user.id_usuario, comidaPrioridad, hoy]
                    );

                    console.log(`✅ [CRON BOT] Comida enviada a usuario ID: ${user.id_usuario}`);
                }
            } catch (error) {
                console.error(`❌ [CRON BOT] Error procesando al usuario ${user.id_usuario}:`, error.message);
            }
            
            // Simular un respiro (Rate Limit precaution timeout)
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    });
};

const activarCronAutomático = () => {
    // Chequear cada minuto (60000ms)
    setInterval(procesarEnviosDiarios, 60000);
    console.log('🤖 Motor de Plan Semanal (Cron Bot) Activado. Monitoreando comidas...');
    
    // Llamar una vez por si el server empezó en medio de una comida
    procesarEnviosDiarios();
};

module.exports = { activarCronAutomático };
