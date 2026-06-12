const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Página de búsqueda con filtros en query string
router.get('/', searchController.searchPage);

module.exports = router;
