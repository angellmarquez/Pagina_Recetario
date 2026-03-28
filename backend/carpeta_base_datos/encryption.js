const crypto = require('node:crypto');

// Llave de 32 bytes y IV de 16 bytes (En un entorno Real esto iría en el .env)
const ALGORITHM = 'aes-256-cbc';
const KEY = '12345678901234567890123456789012'; // 32 chars
const IV = '1234567890123456'; // 16 chars

function encrypt(text) {
    if (!text) return text;
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY), Buffer.from(IV));
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decrypt(text) {
    if (!text) return text;
    try {
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(KEY), Buffer.from(IV));
        let decrypted = decipher.update(text, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        // Si no se puede desencriptar (ej: datos viejos), retornamos el original
        return text;
    }
}

module.exports = { encrypt, decrypt };
