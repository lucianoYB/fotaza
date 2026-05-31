const Publicacion = require('../models/publicacionModel');
const Imagen = require('../models/imagenModel');
const Etiqueta = require('../models/etiquetaModel');
const Comentario = require('../models/comentarioModel');
const upload = require('../middlewares/upload');
const { applyWatermark } = require('../utils/watermark');
const path = require('path');
const fs = require('fs');

// Mostrar formulario de creación
exports.formCrear = (req, res) => {
    res.render('publicaciones/crear', { error: null });
};

// Procesar creación
exports.crear = async (req, res) => {
    try {
        const { titulo, descripcion, etiquetas, licencias, marcas_agua } = req.body;
        const archivos = req.files; // array de archivos subidos
        
        if (!titulo || !archivos || archivos.length === 0) {
            return res.render('publicaciones/crear', { error: 'Título y al menos una imagen son obligatorios' });
        }
        
        // Validar que cada imagen tenga licencia (se envía como array)
        if (!licencias || licencias.length !== archivos.length) {
            return res.render('publicaciones/crear', { error: 'Debe especificar licencia para cada imagen' });
        }
        
        // Crear publicación
        const publicacionId = await Publicacion.create(titulo, descripcion, req.session.usuarioId);
        
        // Procesar etiquetas
        const etiquetasArray = etiquetas ? etiquetas.split(',').map(e => e.trim().toLowerCase()) : [];
        for (const etiqueta of etiquetasArray) {
            if (etiqueta) {
                const etiquetaId = await Etiqueta.findOrCreate(etiqueta);
                await Etiqueta.associateWithPublicacion(publicacionId, etiquetaId);
            }
        }
        
        // Procesar cada imagen
        for (let i = 0; i < archivos.length; i++) {
            const archivo = archivos[i];
            const licencia = licencias[i];
            const textoMarcaAgua = marcas_agua && marcas_agua[i] ? marcas_agua[i] : null;
            
            let rutaFinal = `/uploads/${archivo.filename}`;
            const rutaCompleta = path.join(__dirname, '../uploads', archivo.filename);
            
            // Si es copyright y tiene texto de marca de agua, aplicar watermark
            if (licencia === 'copyright' && textoMarcaAgua) {
                const nombreWatermarked = `wm_${archivo.filename}`;
                const rutaWatermarked = path.join(__dirname, '../watermarked', nombreWatermarked);
                await applyWatermark(rutaCompleta, rutaWatermarked, textoMarcaAgua);
                rutaFinal = `/watermarked/${nombreWatermarked}`;
                // Opcional: eliminar original para ahorrar espacio? Mejor conservar ambos.
            }
            
            await Imagen.create(publicacionId, rutaFinal, licencia, textoMarcaAgua);
        }
        
        res.redirect(`/publicacion/${publicacionId}`);
    } catch (err) {
        console.error(err);
        res.render('publicaciones/crear', { error: 'Error al crear publicación' });
    }
};

// Ver una publicación individual
exports.ver = async (req, res) => {
    const publicacionId = req.params.id;
    try {
        const publicacion = await Publicacion.findById(publicacionId);
        if (!publicacion) return res.status(404).send('Publicación no encontrada');
        
        const imagenes = await Publicacion.getImagenesByPublicacion(publicacionId);
        const etiquetas = await Publicacion.getEtiquetasByPublicacion(publicacionId);
        
        const comentariosPorImagen = {};
        for (const img of imagenes) {
            comentariosPorImagen[img.id] = await Comentario.findByImagen(img.id);
        }

        res.render('publicaciones/ver', { publicacion, imagenes, etiquetas, comentariosPorImagen });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error interno');
    }
};

// Mostrar home con balance de imágenes (lógica simple por ahora)
exports.home = async (req, res) => {
    try {
        // Obtener imágenes con promedio > 4 y más de 5 votos como "destacadas"
        const [destacadas] = await db.execute(`
            SELECT i.*, p.titulo, p.id as publicacion_id
            FROM imagen i
            JOIN publicacion p ON i.publicacion_id = p.id
            WHERE i.valoracion_promedio >= 4 AND i.total_valoraciones >= 5
            ORDER BY i.valoracion_promedio DESC
            LIMIT 10
        `);
        // Otras imágenes aleatorias
        const [otras] = await db.execute(`
            SELECT i.*, p.titulo, p.id as publicacion_id
            FROM imagen i
            JOIN publicacion p ON i.publicacion_id = p.id
            WHERE NOT (i.valoracion_promedio >= 4 AND i.total_valoraciones >= 5)
            ORDER BY RAND()
            LIMIT 10
        `);
        
        res.render('index', { destacadas, otras });
    } catch (err) {
        console.error(err);
        res.render('index', { destacadas: [], otras: [] });
    }
};

