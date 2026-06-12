const express = require('express');
const router = express.Router();
const interesController = require('../controllers/interesController');

router.post('/imagen/:imagenId', interesController.marcarInteres);
router.get('/recibidos', interesController.misInteresesRecibidos);
router.get('/enviados', interesController.misInteresesEnviados);
router.get('/chat/:interesId', interesController.verChat);
router.post('/chat/:interesId/mensaje', interesController.enviarMensaje);

module.exports = router;