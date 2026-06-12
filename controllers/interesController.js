const db = require('../config/db');
const Interes = require('../models/interesModel');
const Mensaje = require('../models/mensajeModel');
const Notificacion = require('../models/notificacionModel');

exports.marcarInteres = async (req, res) => {
    const { imagenId } = req.params;
    const compradorId = req.session.usuarioId;
    try {
        const Imagen = require('../models/imagenModel');
        const Publicacion = require('../models/publicacionModel');
        const imagen = await Imagen.findById(imagenId);
        const publicacion = await Publicacion.findById(imagen.publicacion_id);
        const autorId = publicacion.usuario_id;
        if (compradorId === autorId) return res.status(400).json({ error: 'No puedes interesarte en tu propia imagen' });
        const ya = await Interes.yaInteresado(imagenId, compradorId);
        if (ya) return res.status(400).json({ error: 'Ya manifestaste interés en esta imagen' });
        await Interes.registrar(imagenId, compradorId, autorId);
        // Notificar al autor
        await Notificacion.crear(autorId, 'me_interesa', compradorId, imagenId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.misInteresesRecibidos = async (req, res) => {
    const intereses = await Interes.getRecibidos(req.session.usuarioId);
    res.render('intereses/recibidos', { intereses });
};

exports.misInteresesEnviados = async (req, res) => {
    const intereses = await Interes.getEnviados(req.session.usuarioId);
    res.render('intereses/enviados', { intereses });
};

exports.verChat = async (req, res) => {
    const { interesId } = req.params;
    const usuarioId = req.session.usuarioId;
    // Verificar que el usuario es parte del interés (autor o comprador)
    const [interes] = await db.execute(
        `SELECT i.*, img.ruta_archivo, p.titulo, u.nombre AS comprador_nombre
         FROM interes_imagen i
         JOIN imagen img ON i.imagen_id = img.id
         JOIN publicacion p ON img.publicacion_id = p.id
         JOIN usuario u ON i.comprador_usuario_id = u.id
         WHERE i.id = ? AND (i.autor_usuario_id = ? OR i.comprador_usuario_id = ?)`,
        [interesId, usuarioId, usuarioId]
    );
    if (!interes.length) return res.status(404).send('No autorizado');
    const mensajes = await Mensaje.getConversacion(interesId, usuarioId);
    // Marcar mensajes como leídos
    await Mensaje.marcarLeidos(interesId, usuarioId);
    res.render('intereses/chat', { interes: interes[0], mensajes });
};

exports.enviarMensaje = async (req, res) => {
    const { interesId } = req.params;
    const { mensaje } = req.body;
    const remitenteId = req.session.usuarioId;
    if (!mensaje || mensaje.trim() === '') return res.status(400).json({ error: 'Mensaje vacío' });
    // Obtener destinatario
    const [rows] = await db.execute(
        'SELECT autor_usuario_id, comprador_usuario_id FROM interes_imagen WHERE id = ?',
        [interesId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Interés no encontrado' });
    // Verificar que el remitente forma parte de la conversación
    const row = rows[0];
    if (row.autor_usuario_id !== remitenteId && row.comprador_usuario_id !== remitenteId) {
        return res.status(403).json({ error: 'No autorizado para enviar mensajes en esta conversación' });
    }
    const destinatarioId = (rows[0].autor_usuario_id === remitenteId) ? rows[0].comprador_usuario_id : rows[0].autor_usuario_id;
    await Mensaje.enviar(interesId, remitenteId, destinatarioId, mensaje);
    // Notificar (opcional) - podríamos crear notificación de nuevo mensaje
    res.json({ success: true });
};