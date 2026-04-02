const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');

// Intentamos buscar rutas comunes de Chrome o Edge en Windows
const buscarNavegador = () => {
    const rutas = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
    ];
    for (const ruta of rutas) {
        if (fs.existsSync(ruta)) return ruta;
    }
    return null;
};

const executablePath = buscarNavegador();

const clienteWasap = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        ...(executablePath ? { executablePath } : {})
    }
});

let isReady = false;

clienteWasap.on('qr', (qr) => {
    console.log('=== ESCANEA ESTE CÓDIGO QR CON TU WHATSAPP (04241415299) ===');
    qrcode.generate(qr, { small: true });
});

clienteWasap.on('ready', () => {
    console.log('✅ Bot de WhatsApp (04241415299) conectado y listo para enviar mensajes.');
    isReady = true;
});

clienteWasap.on('auth_failure', msg => {
    console.error('❌ Fallo la autenticación con WhatsApp:', msg);
});

clienteWasap.on('disconnected', (reason) => {
    console.log('❌ WhatsApp se desconectó:', reason);
    isReady = false;
});

const inicializarBot = () => {
    console.log('Iniciando cliente de WhatsApp...');
    clienteWasap.initialize();
};

const enviarMensajeWasap = async (telefonoDestino, mensaje) => {
    if (!isReady) {
        throw new Error('El bot de WhatsApp aún no está listo o no ha escaneado el código QR.');
    }

    // Asegurarse de que el teléfono tenga el formato correcto para WhatsApp (58424... o similar, seguido de @c.us)
    // El usuario proveerá su teléfono en el formato que tenga, limpiémoslo
    let numeroLimpio = telefonoDestino.replace(/\D/g, '');
    
    // Si empieza con 0, asumimos formato local venezolano y lo convertimos: 0424... -> 58424...
    if (numeroLimpio.startsWith('0')) {
        numeroLimpio = '58' + numeroLimpio.substring(1);
    } else if (!numeroLimpio.startsWith('58') && numeroLimpio.length === 10) {
        // En caso de que ponga 4241234567, añadimos 58
        numeroLimpio = '58' + numeroLimpio;
    }

    const chatId = `${numeroLimpio}@c.us`;

    try {
        await clienteWasap.sendMessage(chatId, mensaje);
        return true;
    } catch (error) {
        console.error('Error enviando mensaje por WhatsApp:', error);
        throw error;
    }
};

module.exports = {
    inicializarBot,
    enviarMensajeWasap
};
