
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { encrypt, decrypt } = require('./encryption');

// Importamos la conexión a la base de datos que acabamos de crear
const connection = require('./conexion');

// Guardar plan semanal (Permite múltiples planes)
router.post('/plan-semanal/guardar', (req, res) => {
    const { id_usuario, plan_json, nombre_plan } = req.body;
    if (!id_usuario || !plan_json) {
        return res.status(400).json({ success: false, mensaje: 'Faltan datos para guardar el plan semanal' });
    }
    
    const query = `INSERT INTO planes_semanales (id_usuario, plan_json, nombre_plan) VALUES (?, ?, ?)`;
    connection.query(query, [id_usuario, plan_json, nombre_plan || 'Mi Plan Semanal'], (err, results) => {
        if (err) {
            console.error("Error al guardar plan:", err);
            return res.status(500).json({ success: false, mensaje: 'Error al guardar el plan semanal' });
        }
        res.json({ success: true, mensaje: '¡Plan semanal guardado correctamente, mijo!', id_plan: results.insertId });
    });
});

// Obtener lista de planes de un usuario (Solo metadata)
router.get('/plan-semanal/usuario/:id_usuario', (req, res) => {
    const { id_usuario } = req.params;
    const query = 'SELECT id_plan, nombre_plan, fecha_creacion FROM planes_semanales WHERE id_usuario = ? ORDER BY fecha_creacion DESC';
    connection.query(query, [id_usuario], (err, results) => {
        if (err) return res.status(500).json({ success: false, mensaje: 'Error al obtener los planes' });
        res.json({ success: true, planes: results });
    });
});

// Obtener detalle de un plan específico
router.get('/plan-semanal/detalle/:id_plan', (req, res) => {
    const { id_plan } = req.params;
    const query = 'SELECT plan_json FROM planes_semanales WHERE id_plan = ?';
    connection.query(query, [id_plan], (err, results) => {
        if (err) return res.status(500).json({ success: false, mensaje: 'Error al obtener el detalle del plan' });
        if (results.length === 0) return res.status(404).json({ success: false, mensaje: 'Plan no encontrado' });
        res.json({ success: true, plan: JSON.parse(results[0].plan_json) });
    });
});

// Eliminar un plan semanal
router.delete('/plan-semanal/:id_plan', (req, res) => {
    const { id_plan } = req.params;
    const query = 'DELETE FROM planes_semanales WHERE id_plan = ?';
    connection.query(query, [id_plan], (err) => {
        if (err) return res.status(500).json({ success: false, mensaje: 'Error al eliminar el plan' });
        res.json({ success: true, mensaje: 'Plan eliminado correctamente' });
    });
});


// Ruta para el Login
router.post('/login', (req, res) => {
    try {
        let { usuario, password } = req.body;

        if (!usuario || !password) {
            return res.status(400).json({ success: false, mensaje: 'Usuario y contraseña obligatorios' });
        }

        usuario = usuario.toString().trim();
        password = password.toString().trim();

        if (usuario.length > 30 || password.length > 30) {
            return res.status(400).json({ success: false, mensaje: 'Usuario o contraseña excede los 30 caracteres' });
        }

        // Encriptamos el email del input para poder compararlo con la base de datos (Deterministic)
        const encryptedInput = encrypt(usuario);

        const query = 'SELECT * FROM usuarios WHERE nombre = ? OR email = ?';
        connection.query(query, [encryptedInput, encryptedInput], async (err, results) => {
            if (err) {
                console.error("Login Query Error:", err);
                return res.status(500).json({ success: false, mensaje: 'Error del servidor' });
            }

            if (results.length > 0) {
                const user = results[0];
                const match = await bcrypt.compare(password, user.password);

                if (match) {
                    // Desencreptamos los datos antes de enviarlos al frontend
                    const userLimpio = {
                        ...user,
                        nombre: decrypt(user.nombre),
                        email: decrypt(user.email),
                        telefono: decrypt(user.telefono),
                        preferencias_dieteticas: decrypt(user.preferencias_dieteticas)
                    };
                    res.json({ success: true, mensaje: 'Login exitoso', usuario: userLimpio });
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

// Ruta para Registrar una Cuenta Nueva
router.post('/registro', async (req, res) => {
    let { nombre, email, password, telefono } = req.body;

    if (!nombre || !email || !password) {
        return res.status(400).json({ success: false, mensaje: 'Nombre, Email y Contraseña obligatorios' });
    }

    nombre = nombre.toString().trim();
    email = email.toString().trim();
    password = password.toString().trim();
    if (telefono) telefono = telefono.toString().trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, mensaje: 'Formato de email inválido' });
    }

    if (password.length < 5 || password.length > 20) {
        return res.status(400).json({ success: false, mensaje: 'La contraseña debe tener mínimo 5 caracteres' });
    }

    const regexLetras = /[a-zA-Z]/;
    const regexNumeros = /\d/;
    if (!regexLetras.test(password) || !regexNumeros.test(password)) {
        return res.status(400).json({ success: false, mensaje: 'La contraseña debe incluir números y letras' });
    }

    if (telefono && !/^\d+$/.test(telefono)) {
        return res.status(400).json({ success: false, mensaje: 'El teléfono debe contener solo números' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Encriptamos los datos personales
        const eNombre = encrypt(nombre);
        const eEmail = encrypt(email);
        const eTelefono = encrypt(telefono);

        const query = 'INSERT INTO usuarios (nombre, email, password, telefono) VALUES (?, ?, ?, ?)';
        connection.query(query, [eNombre, eEmail, hashedPassword, eTelefono || null], (err, results) => {
            if (err) {
                console.error("Register Query Error:", err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ success: false, mensaje: 'Este email ya está registrado' });
                }
                return res.status(500).json({ success: false, mensaje: 'Error al registrar usuario' });
            }
            res.status(201).json({ success: true, mensaje: 'Cuenta creada' });
        });
    } catch (error) {
        console.error("FATAL SYNC ERROR in REGISTER:", error);
        res.status(500).json({ success: false, mensaje: 'Error al procesar el registro' });
    }
});

// Ruta para actualizar perfil (preferencias y nombre)
router.put('/perfil/:id', (req, res) => {
    const { id } = req.params;
    let { preferencias_dieteticas, nombre } = req.body;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, mensaje: 'ID de usuario inválido' });
    }

    const updates = [];
    const values = [];

    if (preferencias_dieteticas !== undefined && preferencias_dieteticas !== null) {
        updates.push('preferencias_dieteticas = ?');
        values.push(encrypt(preferencias_dieteticas.toString().trim()));
    }

    if (nombre !== undefined && nombre !== null && nombre.toString().trim() !== '') {
        updates.push('nombre = ?');
        values.push(encrypt(nombre.toString().trim()));
    }

    if (updates.length === 0) {
        return res.status(400).json({ success: false, mensaje: 'No hay datos para actualizar' });
    }

    const query = `UPDATE usuarios SET ${updates.join(', ')} WHERE id_usuario = ?`;
    values.push(id);

    connection.query(query, values, (err, results) => {
        if (err) return res.status(500).json({ success: false, mensaje: 'Error al actualizar perfil' });
        res.json({ success: true, mensaje: 'Perfil actualizado' });
    });
});

// Ruta para guardar una receta
router.post('/recetas/guardar', (req, res) => {
    let { id_usuario, titulo, descripcion } = req.body;

    if (!id_usuario || !titulo || !descripcion) {
        return res.status(400).json({ success: false, mensaje: 'Usuario, título y descripción son obligatorios' });
    }

    titulo = titulo.toString().trim();
    descripcion = descripcion.toString().trim();

    const queryVerificar = `
        SELECT r.id_receta FROM recetas r 
        JOIN historial_ia h ON r.id_receta = h.id_receta 
        WHERE h.id_usuario = ? AND r.titulo = ? AND h.tipo_interaccion = 'guardada'
    `;

    connection.query(queryVerificar, [id_usuario, titulo], (err, resultsVerificar) => {
        if (err) return res.status(500).json({ success: false, mensaje: 'Error al verificar duplicados' });

        if (resultsVerificar.length > 0) {
            return res.status(409).json({ success: false, mensaje: 'Ya has guardado esta receta' });
        }

        const queryReceta = 'INSERT INTO recetas (titulo, descripcion) VALUES (?, ?)';
        connection.query(queryReceta, [titulo, descripcion], (err, results) => {
            if (err) return res.status(500).json({ success: false, mensaje: 'Error al guardar receta' });

            const id_receta = results.insertId;
            const queryHistorial = 'INSERT INTO historial_ia (id_usuario, id_receta, tipo_interaccion) VALUES (?, ?, ?)';
            connection.query(queryHistorial, [id_usuario, id_receta, 'guardada'], (err) => {
                if (err) return res.status(500).json({ success: false, mensaje: 'Error al vincular receta' });
                res.json({ success: true, mensaje: 'Receta guardada mijo!' });
            });
        });
    });
});

// Ruta para obtener recetas guardadas de un usuario
router.get('/recetas/usuario/:id', (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, mensaje: 'ID de usuario inválido' });
    }

    const query = `
        SELECT r.* FROM recetas r
        JOIN historial_ia h ON r.id_receta = h.id_receta
        WHERE h.id_usuario = ? AND h.tipo_interaccion = 'guardada'
    `;
    connection.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ success: false, mensaje: 'Error al obtener recetas' });
        res.json({ success: true, recetas: results });
    });
});

// Ruta para eliminar una receta guardada
router.delete('/recetas/eliminar/:id_usuario/:id_receta', (req, res) => {
    const { id_usuario, id_receta } = req.params;

    if (!id_usuario || isNaN(id_usuario) || !id_receta || isNaN(id_receta)) {
        return res.status(400).json({ success: false, mensaje: 'IDs inválidos' });
    }

    // Eliminamos la vinculación en historial_ia
    const queryHistorial = 'DELETE FROM historial_ia WHERE id_usuario = ? AND id_receta = ?';
    connection.query(queryHistorial, [id_usuario, id_receta], (err) => {
        if (err) return res.status(500).json({ success: false, mensaje: 'Error al eliminar vinculación' });

        // Opcionalmente eliminamos la receta de la tabla recetas
        const queryReceta = 'DELETE FROM recetas WHERE id_receta = ?';
        connection.query(queryReceta, [id_receta], (err) => {
            if (err) return res.status(500).json({ success: false, mensaje: 'Error al eliminar receta' });
            res.json({ success: true, mensaje: 'Receta eliminada mijo!' });
        });
    });
});

// --- FLUJO DE RECUPERACIÓN SEGURA (CÓDIGO POR CORREO) ---

// 1. Solicitar Código
router.post('/recuperar/solicitar', async (req, res) => {
    let { email } = req.body;
    if (!email) return res.status(400).json({ success: false, mensaje: 'Email obligatorio' });

    try {
        const eEmail = encrypt(email.toString().trim());
        
        // Verificamos si el usuario existe
        connection.query('SELECT id_usuario FROM usuarios WHERE email = ?', [eEmail], (err, results) => {
            if (err) return res.status(500).json({ success: false, mensaje: 'Error de base de datos' });
            if (results.length === 0) return res.status(404).json({ success: false, mensaje: 'Correo no registrado' });

            const id_usuario = results[0].id_usuario;
            const codigo = Math.floor(100000 + Math.random() * 900000).toString();

            connection.query('DELETE FROM codigos_recuperacion WHERE id_usuario = ?', [id_usuario], () => {
                connection.query('INSERT INTO codigos_recuperacion (id_usuario, codigo) VALUES (?, ?)', [id_usuario, codigo], (err) => {
                    if (err) return res.status(500).json({ success: false, mensaje: 'Error al generar código' });
                    
                    // ENVÍO DE CORREO REAL CON NODEMAILER
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
                        text: `Hola mijo! Tu código de recuperación es: ${codigo}. Tienes 15 minutos para usarlo.`,
                        html: `
                            <div style="font-family: Arial; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                                <h1 style="color: #003893;">VEN<span style="color: #f1c40f;">IA</span></h1>
                                <p>Hola mijo/a, recibimos una solicitud para restablecer tu contraseña.</p>
                                <div style="background: #f9f9f9; padding: 15px; text-align: center; border-radius: 5px;">
                                    <p style="font-size: 14px; margin: 0;">Tu código de seguridad es:</p>
                                    <h2 style="font-size: 32px; color: #EF3340; margin: 10px 0;">${codigo}</h2>
                                    <p style="font-size: 11px; color: #888;">(Válido por 15 minutos)</p>
                                </div>
                                <p style="font-size: 14px;">Si no fuiste tú, simplemente ignora este mensaje.</p>
                                <hr />
                                <p style="font-size: 12px; color: #aaa;">El equipo de VENIA 🇻🇪</p>
                            </div>
                        `
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.error("Error enviando email:", error);
                            // Fallback a consola si falla el envío real
                            console.log(`🔑 [FALLBACK] Tu código es: ${codigo}`);
                            return res.json({ success: true, mensaje: 'Hubo un problema enviando el correo, pero el código se generó (revisa la consola si eres el admin)' });
                        }
                        console.log('Correo enviado: ' + info.response);
                        res.json({ success: true, mensaje: '¡Código enviado! Revisa tu bandeja de entrada.' });
                    });
                });
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, mensaje: 'Error del servidor' });
    }
});

// 2. Verificar Código
router.post('/recuperar/verificar', (req, res) => {
    let { email, codigo } = req.body;
    if (!email || !codigo) return res.status(400).json({ success: false, mensaje: 'Email y código requeridos' });

    const eEmail = encrypt(email.toString().trim());
    const query = `
        SELECT c.id FROM codigos_recuperacion c
        JOIN usuarios u ON c.id_usuario = u.id_usuario
        WHERE u.email = ? AND c.codigo = ? 
        AND c.fecha_creacion > NOW() - INTERVAL 15 MINUTE
    `;

    connection.query(query, [eEmail, codigo], (err, results) => {
        if (err) return res.status(500).json({ success: false, mensaje: 'Error al verificar' });
        if (results.length === 0) return res.status(401).json({ success: false, mensaje: 'Código inválido o expirado' });

        res.json({ success: true, mensaje: 'Código verificado correctamente' });
    });
});

// 3. Restablecer Contraseña
router.post('/recuperar/restablecer', async (req, res) => {
    let { email, codigo, nuevaPassword } = req.body;
    if (!email || !codigo || !nuevaPassword) return res.status(400).json({ success: false, mensaje: 'Faltan datos' });

    if (nuevaPassword.length < 5) return res.status(400).json({ success: false, mensaje: 'Mínimo 5 caracteres' });

    try {
        const eEmail = encrypt(email.toString().trim());
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(nuevaPassword, salt);

        const queryVerificar = `
            SELECT c.id_usuario FROM codigos_recuperacion c
            JOIN usuarios u ON c.id_usuario = u.id_usuario
            WHERE u.email = ? AND c.codigo = ?
        `;

        connection.query(queryVerificar, [eEmail, codigo], (err, results) => {
            if (err || results.length === 0) return res.status(401).json({ success: false, mensaje: 'Sesión de recuperación inválida' });

            const id_usuario = results[0].id_usuario;
            connection.query('UPDATE usuarios SET password = ? WHERE id_usuario = ?', [hashedPassword, id_usuario], (err) => {
                if (err) return res.status(500).json({ success: false, mensaje: 'Error al actualizar' });
                connection.query('DELETE FROM codigos_recuperacion WHERE id_usuario = ?', [id_usuario]);
                res.json({ success: true, mensaje: 'Contraseña actualizada. Ya puedes iniciar sesión!' });
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, mensaje: 'Error fatal' });
    }
});

module.exports = router;
