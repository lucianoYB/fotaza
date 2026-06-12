function requireRol(rolesPermitidos) {
    return (req, res, next) => {
        if (!req.session.usuario) return res.redirect('/login');
        if (rolesPermitidos.includes(req.session.usuario.rol)) return next();
        res.status(403).send('No tienes permiso');
    };
}
module.exports = { requireRol };