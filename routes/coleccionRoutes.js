const express = require('express');
const router = express.Router();
const coleccionController = require('../controllers/coleccionController');

router.get('/', coleccionController.misColecciones);
router.post('/', coleccionController.crearColeccion);
router.get('/:id', coleccionController.verColeccion);
router.delete('/:id', coleccionController.eliminarColeccion);
router.post('/guardar', coleccionController.guardarEnColeccion);
router.post('/quitar', coleccionController.quitarDeColeccion);

module.exports = router;