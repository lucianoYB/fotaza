const DenunciaImagen = require('../models/denunciaImagenModel');
const Imagen = require('../models/imagenModel');

exports.denunciarImagen = async (req, res) => {
    const imagenId = req.params.id;
    const { motivo, descripcion } = req.body;
    const usuarioId = req.session.usuarioId;
    
    try {
        // Evitar que el autor denuncie su propia imagen (opcional)
        const imagen = await Imagen.findById(imagenId);
        const publicacion = await require('../models/publicacionModel').findById(imagen.publicacion_id);
        if (publicacion.usuario_id === usuarioId) {
            return res.status(403).json({ error: 'No puedes denunciar tu propia imagen' });
        }
        
        await DenunciaImagen.create(imagenId, usuarioId, motivo, descripcion);
        
        // Verificar si alcanzó 3 denuncias distintas
        const totalDenuncias = await DenunciaImagen.countDistinctByImagen(imagenId);
        if (totalDenuncias >= 3) {
            // Marcar publicación para revisión del validador (podemos tener tabla publicacion_revision o un campo)
            // Por ahora, solo registramos. En la fase del validador, se mostrarán.
            console.log(`Imagen ${imagenId} tiene ${totalDenuncias} denuncias, requiere revisión`);
        }
        res.json({ success: true });
    } catch (err) {
        if (err.message === 'Ya denunciaste esta imagen') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Error al denunciar' });
    }
};