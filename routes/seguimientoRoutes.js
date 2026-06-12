const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middlewares/authMiddleware');
const seguimientoController = require('../controllers/seguimientoController');
const feedController = require('../controllers/feedController');
const notificacionController = require('../controllers/notificacionController');


router.post('/seguir/:id', requireLogin, seguimientoController.follow);
router.post('/seguir/:id/deshacer', requireLogin, seguimientoController.unfollow);
router.delete('/seguir/:id', requireLogin, seguimientoController.unfollow);


router.get('/usuario/:id', seguimientoController.verPerfil);


router.get('/feed', requireLogin, feedController.feed);


router.get('/notificaciones', requireLogin, notificacionController.misNotificaciones);
router.post('/notificacion/:id/leer', requireLogin, notificacionController.marcarLeida);
router.post('/notificaciones/leer-todas', requireLogin, notificacionController.marcarTodasLeidas);

module.exports = router;