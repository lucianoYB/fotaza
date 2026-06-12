// Middleware para proteger rutas (solo usuarios logueados)
function requireLogin(req, res, next) {
    if (req.session && req.session.usuarioId) {
        return next();
    }
    // Si la petición espera JSON (AJAX/fetch), devolver 401 JSON en lugar de redirect
    const acceptsJson = req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1) || req.headers['x-requested-with'] === 'XMLHttpRequest';
    if (acceptsJson) {
        return res.status(401).json({ error: 'Debes iniciar sesión' });
    }
    return res.redirect('/login?error=Debes iniciar sesión');
}

// Middleware para redirigir si ya está logueado (para login/registro)
function requireGuest(req, res, next) {
    if (req.session && req.session.usuarioId) {
        return res.redirect('/');
    }
    next();
}

const Notificacion = require('../models/notificacionModel');

// Middleware para pasar datos del usuario a todas las vistas
async function userToViews(req, res, next) {
    res.locals.usuario = req.session.usuario || null;
    res.locals.usuarioId = req.session.usuarioId || null;
    if (req.session && req.session.usuarioId) {
        try {
            res.locals.unreadNotifications = await Notificacion.countUnreadByUsuario(req.session.usuarioId);
        } catch (err) {
            console.error('Error al contar notificaciones no leídas:', err);
            res.locals.unreadNotifications = 0;
        }
    } else {
        res.locals.unreadNotifications = 0;
    }
    next();
}

module.exports = { requireLogin, requireGuest, userToViews };