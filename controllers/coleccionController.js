const Coleccion = require('../models/coleccionModel');

exports.misColecciones = async (req, res) => {
    const colecciones = await Coleccion.getByUsuario(req.session.usuarioId);
    res.render('colecciones/index', { colecciones });
};

exports.verColeccion = async (req, res) => {
    const { id } = req.params;
    const coleccion = await Coleccion.getById(id, req.session.usuarioId);
    if (!coleccion) return res.status(404).send('Colección no encontrada');
    const publicaciones = await Coleccion.getPublicaciones(id);
    res.render('colecciones/ver', { coleccion, publicaciones });
};

exports.crearColeccion = async (req, res) => {
    const { nombre } = req.body;
    if (!nombre || nombre.trim() === '') {
        return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    try {
        await Coleccion.crear(req.session.usuarioId, nombre.trim());
        res.json({ success: true });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Ya tienes una colección con ese nombre' });
        }
        res.status(500).json({ error: 'Error al crear colección' });
    }
};

exports.guardarEnColeccion = async (req, res) => {
    const { coleccionId, publicacionId } = req.body;
    // Verificar propiedad de la colección
    const coleccion = await Coleccion.getById(coleccionId, req.session.usuarioId);
    if (!coleccion) return res.status(403).json({ error: 'No autorizado' });
    const yaExiste = await Coleccion.existePublicacionEnColeccion(coleccionId, publicacionId);
    if (yaExiste) return res.status(400).json({ error: 'La publicación ya está en esta colección' });
    await Coleccion.guardarPublicacion(coleccionId, publicacionId);
    res.json({ success: true });
};

exports.quitarDeColeccion = async (req, res) => {
    const { coleccionId, publicacionId } = req.body;
    const coleccion = await Coleccion.getById(coleccionId, req.session.usuarioId);
    if (!coleccion) return res.status(403).json({ error: 'No autorizado' });
    await Coleccion.quitarPublicacion(coleccionId, publicacionId);
    res.json({ success: true });
};

exports.eliminarColeccion = async (req, res) => {
    const { id } = req.params;
    await Coleccion.eliminar(id, req.session.usuarioId);
    res.json({ success: true });
};