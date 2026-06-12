const Valoracion = require('../models/valoracionModel');
const Imagen = require('../models/imagenModel');
const Publicacion = require('../models/publicacionModel');
const Notificacion = require('../models/notificacionModel');

exports.valorar = async (req, res) => {
    const imagenId = req.params.id;
    const { puntaje } = req.body;
    const usuarioId = req.session.usuarioId;
    
    try {
        // Verificar que el usuario no sea el autor de la imagen
        const imagen = await Imagen.findById(imagenId);
        const publicacion = await Publicacion.findById(imagen.publicacion_id);
        if (publicacion.usuario_id === usuarioId) {
            return res.status(403).json({ error: 'No puedes valorar tu propia imagen' });
        }
        
        const puntajeNum = parseInt(puntaje);
        if (isNaN(puntajeNum) || puntajeNum < 1 || puntajeNum > 5) {
            return res.status(400).json({ error: 'Puntaje inválido' });
        }
        
        const { promedio, total } = await Valoracion.upsert(imagenId, usuarioId, puntajeNum);
        
        if (publicacion.usuario_id !== usuarioId) {
            await Notificacion.crear(publicacion.usuario_id, 'valoracion', usuarioId, imagenId);
        }
        
        res.json({ success: true, promedio, total });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al valorar' });
    }
};