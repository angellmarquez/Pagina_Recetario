const crypto = require('node:crypto');

// Llave y algoritmo se leen del .env — NUNCA hardcodear en producción
const ALGORITHM = 'aes-256-cbc';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY || '0'.repeat(64), 'hex'); // 32 bytes from hex

/**
 * Encripta texto usando AES-256-CBC con un IV aleatorio por cada operación.
 * El IV se antepone al ciphertext (primeros 32 chars hex = 16 bytes IV).
 */
function encrypt(text) {
    if (!text) return text;
    const iv = crypto.randomBytes(16); // IV aleatorio por cada encriptación
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Concatenamos el IV al inicio para poder desencriptar después
    return iv.toString('hex') + ':' + encrypted;
}

/**
 * Desencripta texto. Detecta automáticamente el formato:
 * - Nuevo formato: "iv_hex:ciphertext_hex"
 * - Formato viejo (legacy): solo "ciphertext_hex" sin IV (para migración)
 */
function decrypt(text) {
    if (!text) return text;
    try {
        if (text.includes(':')) {
            // Formato nuevo con IV aleatorio
            const parts = text.split(':');
            const iv = Buffer.from(parts[0], 'hex');
            const encryptedText = parts[1];
            const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
            let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } else {
            // Fallback: dato que no fue encriptado por nosotros, retornar original
            return text;
        }
    } catch (error) {
        // Si no se puede desencriptar, retornamos el original
        console.error('Decryption error (dato corrupto o clave incorrecta):', error.message);
        return text;
    }
}

module.exports = { encrypt, decrypt };
