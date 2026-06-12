const Seguidor = require('../models/seguidorModel');
const Notificacion = require('../models/notificacionModel');

exports.follow = async (req, res) => {
    const { id: seguidoId } = req.params;
    const seguidorId = req.session.usuarioId;

    try {
        if (parseInt(seguidoId) === seguidorId) {
            return res.status(400).json({ error: 'No puedes seguirte a ti mismo' });
        }
        await Seguidor.follow(seguidorId, seguidoId);
        
        await Notificacion.crear(seguidoId, 'nuevo_seguidor', seguidorId);
        res.json({ success: true });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Ya sigues a este usuario' });
        }
        res.status(500).json({ error: 'Error al seguir' });
    }
};

exports.unfollow = async (req, res) => {
    const { id: seguidoId } = req.params;
    const seguidorId = req.session.usuarioId;

    try {
        await Seguidor.unfollow(seguidorId, seguidoId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error al dejar de seguir' });
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