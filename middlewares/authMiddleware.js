// Middleware para proteger rutas (solo usuarios logueados)
function requireLogin(req, res, next) {
    if (req.session && req.session.usuarioId) {
        return next();
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

// Middleware para pasar datos del usuario a todas las vistas
function userToViews(req, res, next) {
    res.locals.usuario = req.session.usuario || null;
    next();
}

module.exports = { requireLogin, requireGuest, userToViews };