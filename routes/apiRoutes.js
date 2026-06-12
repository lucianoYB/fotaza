const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middlewares/authMiddleware');
const valoracionController = require('../controllers/valoracionController');
const comentarioController = require('../controllers/comentarioController');
const denunciaImagenController = require('../controllers/denunciaImagenController');

// Valoraciones
router.post('/imagen/:id/valorar', requireLogin, valoracionController.valorar);

// Comentarios
router.post('/imagen/:id/comentar', requireLogin, comentarioController.agregarComentario);
router.post('/comentario/:id/denunciar', requireLogin, comentarioController.denunciarComentario);
router.delete('/comentario/:id', requireLogin, comentarioController.eliminarComentario);
router.post('/publicacion/:id/cerrar-comentarios', requireLogin, comentarioController.cerrarComentarios);

// Denuncias de imágenes
router.post('/imagen/:id/denunciar', requireLogin, denunciaImagenController.denunciarImagen);

module.exports = router;