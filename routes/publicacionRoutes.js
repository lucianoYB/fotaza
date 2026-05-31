const express = require('express');
const router = express.Router();
const publicacionController = require('../controllers/publicacionController');
const { requireLogin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

// Crear publicación (requiere login)
router.get('/crear', requireLogin, publicacionController.formCrear);
router.post('/crear', requireLogin, upload.array('imagenes', 10), publicacionController.crear);

// Ver publicación (público)
router.get('/:id', publicacionController.ver);

// Ruta home (la movemos aquí o la dejamos en app.js)
router.get('/', publicacionController.home);

module.exports = router;