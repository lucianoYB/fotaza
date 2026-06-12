const DenunciaImagen = require('../models/denunciaImagenModel');
const Publicacion = require('../models/publicacionModel');
const Usuario = require('../models/usuarioModel');


exports.panelValidador = async (req, res) => {
    if (req.session.usuario.rol !== 'validador') {
        return res.status(403).send('Acceso denegado');
    }
    const pendientes = await DenunciaImagen.getImagenesPendientesRevisar();
    // Agrupar por publicación
    const publicacionesMap = new Map();
    for (const item of pendientes) {
        if (!publicacionesMap.has(item.publicacion_id)) {
            const denuncias = await DenunciaImagen.getDenunciasByImagen(item.imagen_id);
            publicacionesMap.set(item.publicacion_id, {
                publicacion_id: item.publicacion_id,
                autor_id: item.autor_id,
                imagenes: [{ imagen_id: item.imagen_id, denuncias_count: item.denuncias_count, denuncias }]
            });
        } else {
            const pub = publicacionesMap.get(item.publicacion_id);
            const denuncias = await DenunciaImagen.getDenunciasByImagen(item.imagen_id);
            pub.imagenes.push({ imagen_id: item.imagen_id, denuncias_count: item.denuncias_count, denuncias });
        }
    }
    res.render('validador/panel', { publicaciones: Array.from(publicacionesMap.values()) });
};

exports.darDeBajaPublicacion = async (req, res) => {
    const { publicacionId } = req.params;
    if (req.session.usuario.rol !== 'validador') return res.status(403).json({ error: 'No autorizado' });
    try {
        
        const publicacion = await Publicacion.findById(publicacionId);
        if (!publicacion) return res.status(404).json({ error: 'Publicación no encontrada' });
        // Cambiar estado de la publicación a 'bajada'
        await Publicacion.cambiarEstado(publicacionId, 'bajada');
        // Incrementar contador de publicaciones bajadas del autor
        await Usuario.incrementarPublicacionesBajadas(publicacion.usuario_id);
        // Verificar si llegó a 3 para inactivar cuenta
        const usuario = await Usuario.findById(publicacion.usuario_id);
        if (usuario.publicaciones_bajadas >= 3) {
            await Usuario.inactivarCuenta(publicacion.usuario_id);
        }
       
        await DenunciaImagen.marcarComoAprobadasPorPublicacion(publicacionId);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al dar de baja' });
    }
};

exports.desestimarDenuncias = async (req, res) => {
    const { publicacionId } = req.params;
    if (req.session.usuario.rol !== 'validador') return res.status(403).json({ error: 'No autorizado' });
    try {
        
        await DenunciaImagen.desestimarPorPublicacion(publicacionId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error al desestimar denuncias' });
    }
};