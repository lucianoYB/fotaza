const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireGuest } = require('../middlewares/authMiddleware');

router.get('/registro', requireGuest, authController.mostrarRegistro);
router.post('/registro', requireGuest, authController.registrar);
router.get('/login', requireGuest, authController.mostrarLogin);
router.post('/login', requireGuest, authController.login);
router.get('/logout', authController.logout);

module.exports = router;