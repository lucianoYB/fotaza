const Notificacion = require('../models/notificacionModel');

exports.misNotificaciones = async (req, res) => {
    const notificaciones = await Notificacion.getByUsuario(req.session.usuarioId);
    res.render('notificaciones', { notificaciones });
};

exports.marcarLeida = async (req, res) => {
    const { id } = req.params;
    await Notificacion.marcarLeida(id, req.session.usuarioId);
    if (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1) {
        return res.json({ success: true });
    }
    res.redirect('/notificaciones');
};

exports.marcarTodasLeidas = async (req, res) => {
    await Notificacion.marcarTodasLeidas(req.session.usuarioId);
    if (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1) {
        return res.json({ success: true });
    }
    res.redirect('/notificaciones');
};