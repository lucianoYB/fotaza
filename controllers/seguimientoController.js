const Seguidor = require('../models/seguidorModel');
const Notificacion = require('../models/notificacionModel');

function clientWantsJson(req) {
    return req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1) || req.headers['x-requested-with'] === 'XMLHttpRequest';
}

exports.follow = async (req, res) => {
    const { id: seguidoId } = req.params;
    const seguidorId = req.session.usuarioId;
    const wantsJson = clientWantsJson(req);

    try {
        if (parseInt(seguidoId) === seguidorId) {
            const error = 'No puedes seguirte a ti mismo';
            if (wantsJson) return res.status(400).json({ error });
            return res.redirect(`/usuario/${seguidoId}?error=${encodeURIComponent(error)}`);
        }
        await Seguidor.follow(seguidorId, seguidoId);
        await Notificacion.crear(seguidoId, 'nuevo_seguidor', seguidorId);
        if (wantsJson) {
            return res.json({ success: true });
        }
        return res.redirect(`/usuario/${seguidoId}`);
    } catch (err) {
        const error = (err.code === 'ER_DUP_ENTRY' || err.message === 'Ya sigues a este usuario') ? 'Ya sigues a este usuario' : 'Error al seguir';
        if (wantsJson) {
            return res.status(err.code === 'ER_DUP_ENTRY' || err.message === 'Ya sigues a este usuario' ? 400 : 500).json({ error });
        }
        return res.redirect(`/usuario/${seguidoId}?error=${encodeURIComponent(error)}`);
    }
};

exports.unfollow = async (req, res) => {
    const { id: seguidoId } = req.params;
    const seguidorId = req.session.usuarioId;
    const wantsJson = clientWantsJson(req);

    try {
        await Seguidor.unfollow(seguidorId, seguidoId);
        if (wantsJson) {
            return res.json({ success: true });
        }
        return res.redirect(`/usuario/${seguidoId}`);
    } catch (err) {
        if (wantsJson) {
            return res.status(500).json({ error: 'Error al dejar de seguir' });
        }
        return res.redirect(`/usuario/${seguidoId}?error=${encodeURIComponent('Error al dejar de seguir')}`);
    }
};


exports.verPerfil = async (req, res) => {
    const { id: usuarioId } = req.params;
    const usuarioActualId = req.session.usuarioId || null;

    const Usuario = require('../models/usuarioModel');
    const Publicacion = require('../models/publicacionModel');

    const perfil = await Usuario.findById(usuarioId);
    if (!perfil) return res.status(404).send('Usuario no encontrado');

    const seguidores = await Seguidor.countFollowers(usuarioId);
    const seguidos = await Seguidor.countFollowing(usuarioId);
    const publicaciones = await Publicacion.findByUsuario(usuarioId);

    let yaSigo = false;
    if (usuarioActualId) {
        yaSigo = await Seguidor.isFollowing(usuarioActualId, usuarioId);
    }

    res.render('perfil', { 
        perfil, 
        seguidores, 
        seguidos, 
        publicaciones, 
        yaSigo,
        esMiPerfil: usuarioActualId === parseInt(usuarioId)
    });
};