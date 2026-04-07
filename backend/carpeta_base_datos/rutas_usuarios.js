
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { encrypt, decrypt } = require('./encryption');
const { generarToken, verificarToken, verificarPropietario } = require('../middleware/auth');

// Importamos el pool de conexiones
const pool = require('./conexion');

// ============================================================
//  RUTAS PÚBLICAS (no requieren JWT)
// ============================================================

// Ruta para el Login
router.post('/login', (req, res) => {
    try {
        let { usuario, password } = req.body;

        if (!usuario || !password) {
            return res.status(400).json({ success: false, mensaje: 'Usuario y contraseña obligatorios' });
        }

        usuario = usuario.toString().trim();
        password = password.toString().trim();

        if (usuario.length > 50 || password.length > 30) {
            return res.status(400).json({ success: false, mensaje: 'Datos exceden la longitud permitida' });
        }

        // Encriptamos el input para comparar con la BD
        const encryptedInput = encrypt(usuario);

        // Buscar por nombre o email encriptado 
        // Como el IV es aleatorio, no podemos comparar directamente el ciphertext
        // Traemos todos los usuarios y desencriptamos para comparar
        const query = 'SELECT * FROM usuarios';
        pool.query(query, async (err, results) => {
            if (err) {
                console.error("Login Query Error:", err);
                return res.status(500).json({ success: false, mensaje: 'Error del servidor' });
            }

            // Buscar el usuario comparando texto desencriptado
            let foundUser = null;
            for (const user of results) {
                const decNombre = decrypt(user.nombre);
                const decEmail = decrypt(user.email);
                if (decNombre === usuario || decEmail === usuario) {
                    foundUser = user;
                    break;
                }
            }

            if (foundUser) {
                const match = await bcrypt.compare(password, foundUser.password);

                if (match) {
                    // Desencriptar preferencias
                    let preferencias = decrypt(foundUser.preferencias_dieteticas);
                    let preferenciasParsed = preferencias;
                    try {
                        preferenciasParsed = JSON.parse(preferencias);
                        if (Array.isArray(preferenciasParsed) && typeof preferenciasParsed[0] === 'string') {
                            preferenciasParsed = preferenciasParsed.map(nombre => ({ nombre, activo: true }));
                        }
                        if (typeof preferenciasParsed === 'string') {
                            preferenciasParsed = preferenciasParsed.split(',').map(nombre => ({ nombre: nombre.trim(), activo: true }));
                        }
                    } catch (e) {
                        if (typeof preferencias === 'string' && preferencias) {
                            preferenciasParsed = preferencias.split(',').map(nombre => ({ nombre: nombre.trim(), activo: true }));
                        }
                    }

                    // Generar JWT
                    const token = generarToken(foundUser);

                    // Construir objeto de usuario SIN password
                    const userLimpio = {
                        id_usuario: foundUser.id_usuario,
                        nombre: decrypt(foundUser.nombre),
                        email: decrypt(foundUser.email),
                        telefono: decrypt(foundUser.telefono),
                        preferencias_dieteticas: preferenciasParsed,
                        bio: foundUser.bio || '',
                        fecha_creacion: foundUser.fecha_creacion || null
                        // NO incluir password
                    };

                    res.json({ success: true, mensaje: 'Login exitoso', token, usuario: userLimpio });
                } else {
                    res.status(401).json({ success: false, mensaje: 'Usuario o contraseña incorrectos' });
                }
            } else {
                res.status(401).json({ success: false, mensaje: 'Usuario o contraseña incorrectos' });
            }
        });
    } catch (err) {
        console.error("FATAL SYNC ERROR in LOGIN:", err);
        res.status(500).json({ success: false, mensaje: 'Error del servidor' });
    }
});

// Ruta para Registrar
router.post('/registro', async (req, res) => {
    let { nombre, email, password, telefono, preferencias_dieteticas, bio } = req.body;

    if (!nombre || !email || !password) {
        return res.status(400).json({ success: false, mensaje: 'Nombre, Email y Contraseña obligatorios' });
    }

    nombre = nombre.toString().trim();
    email = email.toString().trim();
    password = password.toString().trim();
    if (telefono) telefono = telefono.toString().trim();

    // Validaciones
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, mensaje: 'Formato de email inválido' });
    }

    if (nombre.length > 30) {
        return res.status(400).json({ success: false, mensaje: 'El nombre no puede tener más de 30 caracteres' });
    }

    if (telefono) {
        telefono = telefono.replace(/\D/g, '');
        if (telefono.length < 7 || telefono.length > 15) {
            return res.status(400).json({ success: false, mensaje: 'El teléfono debe tener entre 7 y 15 dígitos' });
        }
    }

    if (password.length < 5 || password.length > 30) {
        return res.status(400).json({ success: false, mensaje: 'La contraseña debe tener entre 5 y 30 caracteres' });
    }

    const regexLetras = /[a-zA-Z]/;
    const regexNumeros = /\d/;
    if (!regexLetras.test(password) || !regexNumeros.test(password)) {
        return res.status(400).json({ success: false, mensaje: 'La contraseña debe incluir números y letras' });
    }

    try {
        // Verificar si el email ya existe (desencriptando todos)
        const [allUsers] = await pool.promise().query('SELECT email, telefono FROM usuarios');
        
        for (const user of allUsers) {
            if (decrypt(user.email) === email) {
                return res.status(409).json({ success: false, mensaje: 'Este email ya está registrado' });
            }
            if (telefono && user.telefono && decrypt(user.telefono) === telefono) {
                return res.status(409).json({ success: false, mensaje: '¡Mijo, este teléfono ya está registrado con otra cuenta!' });
            }
        }

        const salt = await bcrypt.genSalt(12); // 12 rounds (más seguro que 10)
        const hashedPassword = await bcrypt.hash(password, salt);

        // Encriptar datos personales (cada uno con IV aleatorio)
        const eNombre = encrypt(nombre);
        const eEmail = encrypt(email);
        const eTelefono = telefono ? encrypt(telefono) : null;

        // Procesar preferencias dietéticas
        let preferencias = '';
        if (preferencias_dieteticas !== undefined && preferencias_dieteticas !== null) {
            if (Array.isArray(preferencias_dieteticas)) {
                if (preferencias_dieteticas.length > 0 && typeof preferencias_dieteticas[0] === 'string') {
                    preferencias = JSON.stringify(preferencias_dieteticas.map(nombre => ({ nombre, activo: true })));
                } else {
                    preferencias = JSON.stringify(preferencias_dieteticas);
                }
            } else if (typeof preferencias_dieteticas === 'object') {
                preferencias = JSON.stringify(preferencias_dieteticas);
            } else if (typeof preferencias_dieteticas === 'string') {
                preferencias = JSON.stringify(preferencias_dieteticas.split(',').map(nombre => ({ nombre: nombre.trim(), activo: true })));
            }
        }

        const bioValue = bio ? bio.toString().trim().slice(0, 200) : '';

        const query = 'INSERT INTO usuarios (nombre, email, password, telefono, preferencias_dieteticas, bio) VALUES (?, ?, ?, ?, ?, ?)';
        pool.query(query, [eNombre, eEmail, hashedPassword, eTelefono, preferencias ? encrypt(preferencias) : null, bioValue], (err) => {
            if (err) {
                console.error("Register Query Error:", err);
                return res.status(500).json({ success: false, mensaje: 'Error al registrar usuario' });
            }
            res.status(201).json({ success: true, mensaje: 'Cuenta creada' });
        });
    } catch (error) {
        console.error("FATAL SYNC ERROR in REGISTER:", error);
        res.status(500).json({ success: false, mensaje: 'Error al procesar el registro' });
    }
});

// --- FLUJO DE RECUPERACIÓN SEGURA ---

// 1. Solicitar Código (respuesta genérica para evitar enumeración)
router.post('/recuperar/solicitar', async (req, res) => {
    let { email } = req.body;
    if (!email) return res.status(400).json({ success: false, mensaje: 'Email obligatorio' });

    try {
        email = email.toString().trim();

        // Buscar usuario por email desencriptando
        const [allUsers] = await pool.promise().query('SELECT id_usuario, email FROM usuarios');
        let foundUser = null;
        for (const user of allUsers) {
            if (decrypt(user.email) === email) {
                foundUser = user;
                break;
            }
        }

        // RESPUESTA GENÉRICA para evitar enumeración de emails
        const mensajeGenerico = 'Si el correo existe, recibirás un código de verificación.';

        if (!foundUser) {
            // No revelamos que el correo no existe
            return res.json({ success: true, mensaje: mensajeGenerico });
        }

        const id_usuario = foundUser.id_usuario;
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();

        // Hashear el código antes de guardarlo
        const codigoHash = await bcrypt.hash(codigo, 10);

        await pool.promise().query('DELETE FROM codigos_recuperacion WHERE id_usuario = ?', [id_usuario]);
        await pool.promise().query('INSERT INTO codigos_recuperacion (id_usuario, codigo_hash) VALUES (?, ?)', [id_usuario, codigoHash]);

        // Envío de email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"Recetario VENIA" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Código de Recuperación de Contraseña - VENIA',
            text: `Tu código de recuperación es: ${codigo}. Tienes 15 minutos para usarlo.`,
            html: `
                <div style="font-family: Arial; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h1 style="color: #003893;">VEN<span style="color: #f1c40f;">IA</span></h1>
                    <p>Hola, recibimos una solicitud para restablecer tu contraseña.</p>
                    <div style="background: #f9f9f9; padding: 15px; text-align: center; border-radius: 5px;">
                        <p style="font-size: 14px; margin: 0;">Tu código de seguridad es:</p>
                        <h2 style="font-size: 32px; color: #EF3340; margin: 10px 0;">${codigo}</h2>
                        <p style="font-size: 11px; color: #888;">(Válido por 15 minutos — máximo 5 intentos)</p>
                    </div>
                    <p style="font-size: 14px;">Si no fuiste tú, simplemente ignora este mensaje.</p>
                    <hr />
                    <p style="font-size: 12px; color: #aaa;">El equipo de VENIA 🇻🇪</p>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.error("Error enviando email:", error);
            }
            res.json({ success: true, mensaje: mensajeGenerico });
        });
    } catch (error) {
        console.error("Error en recuperación:", error);
        res.status(500).json({ success: false, mensaje: 'Error del servidor' });
    }
});

// 2. Verificar Código (con límite de intentos)
router.post('/recuperar/verificar', async (req, res) => {
    let { email, codigo } = req.body;
    if (!email || !codigo) return res.status(400).json({ success: false, mensaje: 'Email y código requeridos' });

    try {
        email = email.toString().trim();
        codigo = codigo.toString().trim();

        // Buscar usuario
        const [allUsers] = await pool.promise().query('SELECT id_usuario, email FROM usuarios');
        let foundUser = null;
        for (const user of allUsers) {
            if (decrypt(user.email) === email) {
                foundUser = user;
                break;
            }
        }
        if (!foundUser) return res.status(401).json({ success: false, mensaje: 'Código inválido o expirado' });

        // Buscar código vigente
        const [codigos] = await pool.promise().query(
            `SELECT * FROM codigos_recuperacion WHERE id_usuario = ? AND fecha_creacion > NOW() - INTERVAL 15 MINUTE`,
            [foundUser.id_usuario]
        );

        if (codigos.length === 0) {
            return res.status(401).json({ success: false, mensaje: 'Código inválido o expirado' });
        }

        const registro = codigos[0];

        // Verificar límite de intentos
        if (registro.intentos >= 5) {
            await pool.promise().query('DELETE FROM codigos_recuperacion WHERE id_usuario = ?', [foundUser.id_usuario]);
            return res.status(429).json({ success: false, mensaje: 'Demasiados intentos. Solicita un nuevo código.' });
        }

        // Comparar código hasheado
        const match = await bcrypt.compare(codigo, registro.codigo_hash);
        if (!match) {
            // Incrementar intentos
            await pool.promise().query('UPDATE codigos_recuperacion SET intentos = intentos + 1 WHERE id = ?', [registro.id]);
            return res.status(401).json({ success: false, mensaje: `Código incorrecto. Te quedan ${4 - registro.intentos} intentos.` });
        }

        res.json({ success: true, mensaje: 'Código verificado correctamente' });
    } catch (error) {
        console.error("Error verificando código:", error);
        res.status(500).json({ success: false, mensaje: 'Error al verificar' });
    }
});

// 3. Restablecer Contraseña
router.post('/recuperar/restablecer', async (req, res) => {
    let { email, codigo, nuevaPassword } = req.body;
    if (!email || !codigo || !nuevaPassword) return res.status(400).json({ success: false, mensaje: 'Faltan datos' });

    nuevaPassword = nuevaPassword.toString().trim();
    if (nuevaPassword.length < 5) return res.status(400).json({ success: false, mensaje: 'Mínimo 5 caracteres' });

    const regexLetras = /[a-zA-Z]/;
    const regexNumeros = /\d/;
    if (!regexLetras.test(nuevaPassword) || !regexNumeros.test(nuevaPassword)) {
        return res.status(400).json({ success: false, mensaje: 'La contraseña debe incluir números y letras' });
    }

    try {
        email = email.toString().trim();

        // Buscar usuario
        const [allUsers] = await pool.promise().query('SELECT id_usuario, email FROM usuarios');
        let foundUser = null;
        for (const user of allUsers) {
            if (decrypt(user.email) === email) {
                foundUser = user;
                break;
            }
        }
        if (!foundUser) return res.status(401).json({ success: false, mensaje: 'Sesión de recuperación inválida' });

        // Verificar código hasheado
        const [codigos] = await pool.promise().query(
            `SELECT * FROM codigos_recuperacion WHERE id_usuario = ?`,
            [foundUser.id_usuario]
        );

        if (codigos.length === 0) return res.status(401).json({ success: false, mensaje: 'Sesión de recuperación inválida' });

        const match = await bcrypt.compare(codigo.toString().trim(), codigos[0].codigo_hash);
        if (!match) return res.status(401).json({ success: false, mensaje: 'Código inválido' });

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(nuevaPassword, salt);

        await pool.promise().query('UPDATE usuarios SET password = ? WHERE id_usuario = ?', [hashedPassword, foundUser.id_usuario]);
        await pool.promise().query('DELETE FROM codigos_recuperacion WHERE id_usuario = ?', [foundUser.id_usuario]);

        res.json({ success: true, mensaje: 'Contraseña actualizada. ¡Ya puedes iniciar sesión!' });
    } catch (error) {
        console.error("Error restableciendo:", error);
        res.status(500).json({ success: false, mensaje: 'Error fatal' });
    }
});

// Ruta para verificar token (el frontend la usa al cargar)
router.get('/verificar-token', verificarToken, (req, res) => {
    const id_usuario = req.usuario.id_usuario;
    pool.query('SELECT * FROM usuarios WHERE id_usuario = ?', [id_usuario], (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ success: false, mensaje: 'Usuario no encontrado' });
        }
        const user = results[0];
        let preferencias = decrypt(user.preferencias_dieteticas);
        let preferenciasParsed = preferencias;
        try {
            preferenciasParsed = JSON.parse(preferencias);
            if (Array.isArray(preferenciasParsed) && typeof preferenciasParsed[0] === 'string') {
                preferenciasParsed = preferenciasParsed.map(nombre => ({ nombre, activo: true }));
            }
        } catch (e) {
            if (typeof preferencias === 'string' && preferencias) {
                preferenciasParsed = preferencias.split(',').map(nombre => ({ nombre: nombre.trim(), activo: true }));
            }
        }

        const userLimpio = {
            id_usuario: user.id_usuario,
            nombre: decrypt(user.nombre),
            email: decrypt(user.email),
            telefono: decrypt(user.telefono),
            preferencias_dieteticas: preferenciasParsed,
            bio: user.bio || '',
            fecha_creacion: user.fecha_creacion || null
        };
        res.json({ success: true, usuario: userLimpio });
    });
});


// ============================================================
//  RUTAS PROTEGIDAS (requieren JWT + ownership)
// ============================================================

// Guardar plan semanal
router.post('/plan-semanal/guardar', verificarToken, (req, res) => {
    const { plan_json, nombre_plan } = req.body;
    const id_usuario = req.usuario.id_usuario; // Del token, no del body

    if (!plan_json) {
        return res.status(400).json({ success: false, mensaje: 'Faltan datos para guardar el plan semanal' });
    }
    
    const query = `INSERT INTO planes_semanales (id_usuario, plan_json, nombre_plan) VALUES (?, ?, ?)`;
    pool.query(query, [id_usuario, plan_json, nombre_plan || 'Mi Plan Semanal'], (err, results) => {
        if (err) {
            console.error("Error al guardar plan:", err);
            return res.status(500).json({ success: false, mensaje: 'Error al guardar el plan semanal' });
        }
        res.json({ success: true, mensaje: '¡Plan semanal guardado correctamente!', id_plan: results.insertId });
    });
});

// Obtener planes de un usuario
router.get('/plan-semanal/usuario/:id_usuario', verificarToken, verificarPropietario('id_usuario'), (req, res) => {
    const id_usuario = req.usuario.id_usuario;
    const query = 'SELECT id_plan, nombre_plan, fecha_creacion FROM planes_semanales WHERE id_usuario = ? ORDER BY fecha_creacion DESC';
    pool.query(query, [id_usuario], (err, results) => {
        if (err) return res.status(500).json({ success: false, mensaje: 'Error al obtener los planes' });
        res.json({ success: true, planes: results });
    });
});

// Obtener detalle de un plan (verificar que sea del usuario)
router.get('/plan-semanal/detalle/:id_plan', verificarToken, (req, res) => {
    const { id_plan } = req.params;
    const id_usuario = req.usuario.id_usuario;
    const query = 'SELECT plan_json FROM planes_semanales WHERE id_plan = ? AND id_usuario = ?';
    pool.query(query, [id_plan, id_usuario], (err, results) => {
        if (err) return res.status(500).json({ success: false, mensaje: 'Error al obtener el detalle del plan' });
        if (results.length === 0) return res.status(404).json({ success: false, mensaje: 'Plan no encontrado' });
        res.json({ success: true, plan: JSON.parse(results[0].plan_json) });
    });
});

// Eliminar plan (verificar ownership)
router.delete('/plan-semanal/:id_plan', verificarToken, (req, res) => {
    const { id_plan } = req.params;
    const id_usuario = req.usuario.id_usuario;
    const query = 'DELETE FROM planes_semanales WHERE id_plan = ? AND id_usuario = ?';
    pool.query(query, [id_plan, id_usuario], (err) => {
        if (err) return res.status(500).json({ success: false, mensaje: 'Error al eliminar el plan' });
        res.json({ success: true, mensaje: 'Plan eliminado correctamente' });
    });
});

// Enviar WhatsApp (solo al propio usuario)
router.post('/whatsapp/enviar', verificarToken, async (req, res) => {
    const { telefonoDestino, mensaje } = req.body;
    if (!telefonoDestino || !mensaje) {
        return res.status(400).json({ success: false, mensaje: 'Teléfono y mensaje requeridos' });
    }

    try {
        const { enviarMensajeWasap } = require('../bot_whatsapp');
        await enviarMensajeWasap(telefonoDestino, mensaje);
        res.json({ success: true, mensaje: 'Mensaje enviado exitosamente vía WhatsApp' });
    } catch (error) {
        console.error("Error al enviar wasap:", error);
        res.status(500).json({ success: false, mensaje: error.message || 'Error al enviar el WhatsApp' });
    }
});

// Suscribirse al Bot
router.post('/bot/suscribir', verificarToken, (req, res) => {
    const id_usuario = req.usuario.id_usuario;
    const { dieta, numPersonas, promptAdicional, planEsqueleto } = req.body;

    const query = `
        INSERT INTO suscripciones_bot (id_usuario, dieta, num_personas, peticion_adicional, plan_esqueleto, estado) 
        VALUES (?, ?, ?, ?, ?, 'activa')
        ON DUPLICATE KEY UPDATE 
            dieta = VALUES(dieta),
            num_personas = VALUES(num_personas),
            peticion_adicional = VALUES(peticion_adicional),
            plan_esqueleto = VALUES(plan_esqueleto),
            estado = 'activa',
            fecha_suscripcion = CURRENT_TIMESTAMP
    `;
    
    pool.query(query, [id_usuario, dieta, numPersonas, promptAdicional, planEsqueleto], (err) => {
        if (err) {
            console.error("Error suscribiendo al bot:", err);
            return res.status(500).json({ success: false, mensaje: 'Error interno en la Base de Datos.' });
        }

        // Buscar teléfono y enviar mensaje de confirmación
        pool.query('SELECT telefono, nombre FROM usuarios WHERE id_usuario = ?', [id_usuario], async (err, results) => {
            if (!err && results.length > 0 && results[0].telefono) {
                try {
                    const telefonoLimpio = decrypt(results[0].telefono);
                    const nombreLimpio = decrypt(results[0].nombre);
                    if (telefonoLimpio) {
                        const { enviarMensajeWasap } = require('../bot_whatsapp');
                        await enviarMensajeWasap(telefonoLimpio, `*🤖 VENIA AUTO-CHEF ACTIVADO* ✨\n\n¡Hola ${nombreLimpio}! 🎉 Me has delegado la cocina por esta semana.\n¡Prepárate para comer sabroso! 👵🏽🇻🇪`);
                    }
                } catch (e) {
                    console.error("No se pudo enviar WA de bienvenida:", e);
                }
            }
            res.json({ success: true, mensaje: '¡Suscripción Semanal Activa!' });
        });
    });
});

// Estado del bot (solo el propio usuario)
router.get('/bot/estado/:id_usuario', verificarToken, verificarPropietario('id_usuario'), (req, res) => {
    const id_usuario = req.usuario.id_usuario;
    pool.query('SELECT estado, plan_esqueleto FROM suscripciones_bot WHERE id_usuario = ?', [id_usuario], (err, results) => {
        if (err) return res.status(500).json({ success: false });
        if (results.length > 0) {
            let planEsqueleto = null;
            if (results[0].plan_esqueleto) {
                try { planEsqueleto = JSON.parse(results[0].plan_esqueleto); } catch(e){}
            }
            return res.json({ success: true, estado: results[0].estado, planEsqueleto });
        }
        res.json({ success: true, estado: 'inactiva' });
    });
});

// Desuscribirse
router.post('/bot/desuscribir', verificarToken, (req, res) => {
    const id_usuario = req.usuario.id_usuario;
    pool.query("UPDATE suscripciones_bot SET estado = 'inactiva', plan_esqueleto = NULL WHERE id_usuario = ?", [id_usuario], (err) => {
        if (err) return res.status(500).json({ success: false, mensaje: 'Error al cancelar.' });
        res.json({ success: true, mensaje: 'Suscripción cancelada exitosamente.' });
    });
});

// Actualizar perfil (solo el propio)
router.put('/perfil/:id', verificarToken, verificarPropietario('id'), async (req, res) => {
    const id = req.usuario.id_usuario;
    let { preferencias_dieteticas, nombre, telefono, bio, email } = req.body;

    const updates = [];
    const values = [];

    if (preferencias_dieteticas !== undefined && preferencias_dieteticas !== null) {
        let prefString = preferencias_dieteticas;
        if (Array.isArray(preferencias_dieteticas)) {
            if (typeof preferencias_dieteticas[0] === 'string') {
                prefString = preferencias_dieteticas.map(nombre => ({ nombre, activo: true }));
            }
            prefString = JSON.stringify(prefString);
        } else if (typeof preferencias_dieteticas === 'object') {
            prefString = JSON.stringify(preferencias_dieteticas);
        }
        updates.push('preferencias_dieteticas = ?');
        values.push(encrypt(prefString.toString().trim()));
    }

    if (telefono !== undefined && telefono !== null && telefono.toString().trim() !== '') {
        let cleanPhone = telefono.toString().replace(/\D/g, '');
        
        // Verificar que no lo use otro usuario
        try {
            const [allUsers] = await pool.promise().query('SELECT id_usuario, telefono FROM usuarios WHERE id_usuario != ?', [id]);
            for (const user of allUsers) {
                if (user.telefono && decrypt(user.telefono) === cleanPhone) {
                    return res.status(409).json({ success: false, mensaje: '¡Epa! Ese teléfono ya lo está usando otro usuario.' });
                }
            }
            updates.push('telefono = ?');
            values.push(encrypt(cleanPhone));
        } catch (err) {
            console.error("Update Phone Error:", err);
            return res.status(500).json({ success: false, mensaje: 'Error al validar teléfono' });
        }
    }

    if (nombre !== undefined && nombre !== null && nombre.toString().trim() !== '') {
        updates.push('nombre = ?');
        values.push(encrypt(nombre.toString().trim().slice(0, 30)));
    }

    if (email !== undefined && email !== null && email.toString().trim() !== '') {
        updates.push('email = ?');
        values.push(encrypt(email.toString().trim()));
    }

    if (bio !== undefined && bio !== null) {
        updates.push('bio = ?');
        values.push(bio.toString().trim().slice(0, 200));
    }

    if (updates.length === 0) {
        return res.status(400).json({ success: false, mensaje: 'No hay datos para actualizar' });
    }

    const query = `UPDATE usuarios SET ${updates.join(', ')} WHERE id_usuario = ?`;
    values.push(id);

    pool.query(query, values, (err) => {
        if (err) return res.status(500).json({ success: false, mensaje: 'Error al actualizar perfil' });
        
        // Obtener usuario actualizado
        pool.query('SELECT * FROM usuarios WHERE id_usuario = ?', [id], (err2, results2) => {
            if (err2 || !results2 || results2.length === 0) {
                return res.json({ success: true, mensaje: 'Perfil actualizado', usuario: null });
            }
            const user = results2[0];
            let preferencias = decrypt(user.preferencias_dieteticas);
            let preferenciasParsed = preferencias;
            try {
                preferenciasParsed = JSON.parse(preferencias);
                if (Array.isArray(preferenciasParsed) && typeof preferenciasParsed[0] === 'string') {
                    preferenciasParsed = preferenciasParsed.map(nombre => ({ nombre, activo: true }));
                }
            } catch (e) {
                if (typeof preferencias === 'string' && preferencias) {
                    preferenciasParsed = preferencias.split(',').map(nombre => ({ nombre: nombre.trim(), activo: true }));
                }
            }
            const userLimpio = {
                id_usuario: user.id_usuario,
                nombre: decrypt(user.nombre),
                email: decrypt(user.email),
                telefono: decrypt(user.telefono),
                preferencias_dieteticas: preferenciasParsed,
                bio: user.bio || '',
                fecha_creacion: user.fecha_creacion || null
            };
            res.json({ success: true, mensaje: 'Perfil actualizado', usuario: userLimpio });
        });
    });
});

// Guardar receta
router.post('/recetas/guardar', verificarToken, (req, res) => {
    const id_usuario = req.usuario.id_usuario;
    let { titulo, descripcion } = req.body;

    if (!titulo || !descripcion) {
        return res.status(400).json({ success: false, mensaje: 'Título y descripción son obligatorios' });
    }

    titulo = titulo.toString().trim().slice(0, 200);
    descripcion = descripcion.toString().trim();

    const queryVerificar = `
        SELECT r.id_receta FROM recetas r 
        JOIN historial_ia h ON r.id_receta = h.id_receta 
        WHERE h.id_usuario = ? AND r.titulo = ? AND h.tipo_interaccion = 'guardada'
    `;

    pool.query(queryVerificar, [id_usuario, titulo], (err, resultsVerificar) => {
        if (err) return res.status(500).json({ success: false, mensaje: 'Error al verificar duplicados' });
        if (resultsVerificar.length > 0) {
            return res.status(409).json({ success: false, mensaje: 'Ya has guardado esta receta' });
        }

        const queryReceta = 'INSERT INTO recetas (titulo, descripcion) VALUES (?, ?)';
        pool.query(queryReceta, [titulo, descripcion], (err, results) => {
            if (err) return res.status(500).json({ success: false, mensaje: 'Error al guardar receta' });

            const id_receta = results.insertId;
            const queryHistorial = 'INSERT INTO historial_ia (id_usuario, id_receta, tipo_interaccion) VALUES (?, ?, ?)';
            pool.query(queryHistorial, [id_usuario, id_receta, 'guardada'], (err) => {
                if (err) return res.status(500).json({ success: false, mensaje: 'Error al vincular receta' });
                res.json({ success: true, mensaje: '¡Receta guardada!' });
            });
        });
    });
});

// Obtener recetas guardadas
router.get('/recetas/usuario/:id', verificarToken, verificarPropietario('id'), (req, res) => {
    const id = req.usuario.id_usuario;
    const query = `
        SELECT r.* FROM recetas r
        JOIN historial_ia h ON r.id_receta = h.id_receta
        WHERE h.id_usuario = ? AND h.tipo_interaccion = 'guardada'
    `;
    pool.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ success: false, mensaje: 'Error al obtener recetas' });
        res.json({ success: true, recetas: results });
    });
});

// Eliminar receta guardada
router.delete('/recetas/eliminar/:id_usuario/:id_receta', verificarToken, verificarPropietario('id_usuario'), (req, res) => {
    const id_usuario = req.usuario.id_usuario;
    const { id_receta } = req.params;

    if (!id_receta || isNaN(id_receta)) {
        return res.status(400).json({ success: false, mensaje: 'ID de receta inválido' });
    }

    const queryHistorial = 'DELETE FROM historial_ia WHERE id_usuario = ? AND id_receta = ?';
    pool.query(queryHistorial, [id_usuario, id_receta], (err) => {
        if (err) return res.status(500).json({ success: false, mensaje: 'Error al eliminar vinculación' });

        const queryReceta = 'DELETE FROM recetas WHERE id_receta = ?';
        pool.query(queryReceta, [id_receta], (err) => {
            if (err) return res.status(500).json({ success: false, mensaje: 'Error al eliminar receta' });
            res.json({ success: true, mensaje: '¡Receta eliminada!' });
        });
    });
});

module.exports = router;
