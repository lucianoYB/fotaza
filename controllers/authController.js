const bcrypt = require('bcrypt');
const Usuario = require('../models/usuarioModel');

const authController = {
    // Mostrar formulario de registro
    mostrarRegistro: (req, res) => {
        res.render('registro', { error: null });
    },

    // Procesar registro
    registrar: async (req, res) => {
        const { nombre, email, password, confirm_password } = req.body;

        // Validaciones básicas
        if (!nombre || !email || !password) {
            return res.render('registro', { error: 'Todos los campos son obligatorios' });
        }
        if (password !== confirm_password) {
            return res.render('registro', { error: 'Las contraseñas no coinciden' });
        }
        if (password.length < 6) {
            return res.render('registro', { error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        try {
            // Verificar si el email o el nombre ya existen
            const existeEmail = await Usuario.findByEmail(email);
            if (existeEmail) {
                return res.render('registro', { error: 'El email ya está registrado' });
            }
            const existeNombre = await Usuario.findByNombre(nombre);
            if (existeNombre) {
                return res.render('registro', { error: 'El nombre de usuario ya está en uso' });
            }

            // Hashear contraseña
            const hash = await bcrypt.hash(password, 10);
            const nuevoId = await Usuario.create(nombre, email, hash);

            // Iniciar sesión automáticamente
            req.session.usuarioId = nuevoId;
            req.session.usuario = { id: nuevoId, nombre, email, rol: 'usuario' };
            res.redirect('/');
        } catch (err) {
            console.error('Registro error:', err);
            const isDup = err.code === 'ER_DUP_ENTRY' || (err.message && err.message.includes('Duplicate'));
            if (isDup) {
                return res.render('registro', { error: 'El nombre o email ya está registrado' });
            }
            res.render('registro', { error: 'Error del servidor, intente más tarde' });
        }
    },

    // Mostrar login
    mostrarLogin: (req, res) => {
        res.render('login', { error: req.query.error || null });
    },

    // Procesar login
    login: async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.render('login', { error: 'Complete todos los campos' });
        }

        try {
            const usuario = await Usuario.findByEmail(email);
            if (!usuario) {
                return res.render('login', { error: 'Credenciales incorrectas' });
            }
            if (usuario.estado === 'inactivo') {
                return res.render('login', { error: 'Cuenta inactiva, contacte al administrador' });
            }

            const match = await bcrypt.compare(password, usuario.password_hash);
            if (!match) {
                return res.render('login', { error: 'Credenciales incorrectas' });
            }

            // Guardar en sesión
            req.session.usuarioId = usuario.id;
            req.session.usuario = {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            };
            res.redirect('/');
        } catch (err) {
            console.error(err);
            res.render('login', { error: 'Error del servidor' });
        }
    },

    // Logout
    logout: (req, res) => {
        req.session.destroy(err => {
            if (err) console.error(err);
            res.redirect('/login');
        });
    }
};

module.exports = authController;