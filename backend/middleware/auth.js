const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-cambiar-en-produccion';
const JWT_EXPIRATION = '24h';

/**
 * Genera un JWT para un usuario autenticado.
 */
function generarToken(usuario) {
    return jwt.sign(
        { id_usuario: usuario.id_usuario },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
    );
}

/**
 * Middleware: Verifica que la petición incluya un JWT válido.
 * Agrega req.usuario con { id_usuario } al request si es válido.
 */
function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ success: false, mensaje: 'Token de autenticación requerido' });
    }

    // Formato esperado: "Bearer <token>"
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.usuario = { id_usuario: decoded.id_usuario };
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, mensaje: 'Sesión expirada. Inicia sesión nuevamente.' });
        }
        return res.status(403).json({ success: false, mensaje: 'Token inválido' });
    }
}

/**
 * Middleware: Verifica que el usuario autenticado solo acceda a sus propios recursos.
 * Compara req.usuario.id_usuario con el parámetro :id o :id_usuario de la ruta.
 */
function verificarPropietario(paramName = 'id') {
    return (req, res, next) => {
        const idSolicitado = parseInt(req.params[paramName] || req.body.id_usuario);
        const idAutenticado = req.usuario.id_usuario;

        if (idSolicitado && idSolicitado !== idAutenticado) {
            return res.status(403).json({ success: false, mensaje: 'No tienes permiso para acceder a este recurso' });
        }
        next();
    };
}

module.exports = { generarToken, verificarToken, verificarPropietario, JWT_SECRET };
