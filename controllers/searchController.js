const Search = require('../models/searchModel');

exports.searchPage = async (req, res) => {
    // lectura de parámetros desde query string
    const { q, tags, author, licencia, minRating, fromDate, toDate, page } = req.query;
    const tagsArr = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    const results = await Search.searchPublicaciones({ q, tags: tagsArr, author, licencia, minRating, fromDate, toDate, page: page || 1 });
    res.render('search', { results, params: req.query });
};

module.exports = exports;
