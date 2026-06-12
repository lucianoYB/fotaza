const Comentario = require('../models/comentarioModel');
const Publicacion = require('../models/publicacionModel');
const Imagen = require('../models/imagenModel');
const DenunciaComentario = require('../models/denunciaComentarioModel'); // lo crearemos
const Notificacion = require('../models/notificacionModel');
const db = require('../config/db');

exports.agregarComentario = async (req, res) => {
    const imagenId = req.params.id;
    const { texto } = req.body;
    const usuarioId = req.session.usuarioId;
    
    if (!texto || texto.trim() === '') {
        return res.status(400).json({ error: 'El comentario no puede estar vacío' });
    }
    
    try {
        // Verificar si los comentarios están abiertos para esta publicación
        const imagen = await Imagen.findById(imagenId);
        const publicacion = await Publicacion.findById(imagen.publicacion_id);
        if (!publicacion.comentarios_abiertos) {
            return res.status(403).json({ error: 'Los comentarios están cerrados para esta publicación' });
        }
        
        const comentarioId = await Comentario.create(imagenId, usuarioId, texto);
        if (publicacion.usuario_id !== usuarioId) {
            await Notificacion.crear(publicacion.usuario_id, 'comentario', usuarioId, comentarioId);
        }
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al comentar' });
    }
};

exports.cerrarComentarios = async (req, res) => {
    const publicacionId = req.params.id;
    const usuarioId = req.session.usuarioId;
    
    try {
        const publicacion = await Publicacion.findById(publicacionId);
        if (publicacion.usuario_id !== usuarioId) {
            return res.status(403).json({ error: 'No autorizado' });
        }
        // Alternar estado
        const nuevoEstado = !publicacion.comentarios_abiertos;
        await db.execute('UPDATE publicacion SET comentarios_abiertos = ? WHERE id = ?', [nuevoEstado, publicacionId]);
        res.json({ success: true, abiertos: nuevoEstado });
    } catch (err) {
        res.status(500).json({ error: 'Error' });
    }
};

exports.denunciarComentario = async (req, res) => {
    const comentarioId = req.params.id;
    const { motivo, descripcion } = req.body;
    const usuarioId = req.session.usuarioId;
    
    try {
        await DenunciaComentario.create(comentarioId, usuarioId, motivo, descripcion);
        // Marcar comentario como denunciado
        await Comentario.marcarDenunciado(comentarioId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error al denunciar comentario' });
    }
};

exports.eliminarComentario = async (req, res) => {
    const comentarioId = req.params.id;
    const usuarioId = req.session.usuarioId;
    
    try {
        const eliminado = await Comentario.delete(comentarioId, usuarioId);
        if (!eliminado) return res.status(403).json({ error: 'No autorizado o comentario no existe' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error' });
    }
};