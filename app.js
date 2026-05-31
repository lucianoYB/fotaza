const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const { userToViews } = require('./middlewares/authMiddleware');

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
app.use(userToViews);

// Motor de vistas PUG
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Rutas
app.use('/', authRoutes);

// Ruta principal (home)
app.get('/', (req, res) => {
    res.render('index', { title: 'Inicio' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

const publicacionRoutes = require('./routes/publicacionRoutes');

app.use('/', publicacionRoutes); 
app.use('/', authRoutes);
