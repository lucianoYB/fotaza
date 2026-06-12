const Seguidor = require('../models/seguidorModel');
const Publicacion = require('../models/publicacionModel');

exports.feed = async (req, res) => {
    const usuarioId = req.session.usuarioId;
    const followingIds = await Seguidor.getFollowingIds(usuarioId);

    let publicaciones = [];
    if (followingIds.length > 0) {
        publicaciones = await Publicacion.findByUsuarios(followingIds, 20); // últimas 20
    }
    res.render('feed', { publicaciones });
};