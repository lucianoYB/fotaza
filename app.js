const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const multer = require('multer');
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const { requireLogin, userToViews } = require('./middlewares/authMiddleware');

const app = express();

// Configuración de sesiones
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } // 1 día
}));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/watermarked', express.static(path.join(__dirname, 'watermarked')));
app.use(userToViews);

// Motor de vistas PUG
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Rutas
app.use('/', authRoutes);

const publicacionRoutes = require('./routes/publicacionRoutes');

app.use('/publicacion', publicacionRoutes);

// Compatibility redirect for legacy /crear path
app.get('/crear', (req, res) => res.redirect('/publicacion/crear'));

const apiRoutes = require('./routes/apiRoutes');
app.use('/api', apiRoutes);

const seguimientoRoutes = require('./routes/seguimientoRoutes');
app.use('/', seguimientoRoutes);

// Colecciones
const coleccionRoutes = require('./routes/coleccionRoutes');
app.use('/colecciones', requireLogin, coleccionRoutes);

// Intereses y mensajería
const interesRoutes = require('./routes/interesRoutes');
app.use('/intereses', requireLogin, interesRoutes);

const homeController = require('./controllers/homeController');
app.get('/', homeController.home);

const validadorController = require('./controllers/validadorController');
const { requireRol } = require('./middlewares/rolMiddleware');

app.get('/validador/panel', requireLogin, requireRol(['validador']), validadorController.panelValidador);
app.post('/validador/publicacion/:publicacionId/baja', requireLogin, requireRol(['validador']), validadorController.darDeBajaPublicacion);
app.post('/validador/publicacion/:publicacionId/desestimar', requireLogin, requireRol(['validador']), validadorController.desestimarDenuncias);

// Error handler for Multer upload limits
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).render('publicaciones/crear', { error: 'Cada archivo no puede superar 5 MB.' });
        }
        return res.status(400).render('publicaciones/crear', { error: err.message });
    }
    next(err);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});